/*
 * Created by jemo on 2018-8-7.
 * graphql
 */

package graphql

import (
  "log"
  "time"
  "strings"
  //"reflect"
  "strconv"
  "context"
  "net/http"
  "math/rand"
  "io/ioutil"
  "encoding/json"
  "github.com/graphql-go/relay"
  "github.com/graphql-go/graphql"
  r "github.com/dancannon/gorethink"
  "github.com/GiterLab/aliyun-sms-go-sdk/dysms"
  "github.com/satori/go.uuid"
  "go.etcd.io/etcd/clientv3"
  "go.etcd.io/etcd/etcdserver/api/v3rpc/rpctypes"
  "google.golang.org/grpc"
  "github.com/dgrijalva/jwt-go"
)

// ali sms access key
var alismsAccessKeyId string
var alismsAccessKeySecret string

const (
  dialTimeout = 2 * time.Second
  requestTimeout = 10 * time.Second
)

// rethink session
var session *r.Session

func InitDb() {
  var err error
  session, err = r.Connect(r.ConnectOpts{
    Address: "localhost:28015",
    Database: "classroom",
    MaxOpen: 40,
  })
  if err != nil {
    log.Fatalln(err.Error())
  }
  // ali sms access key
  if alismsAccessKey, err := ioutil.ReadFile("pem/alismsAccessKey.csv"); err == nil {
    alismsAccessKeyArray := strings.Split(strings.Split(string(alismsAccessKey), "\n")[1], ",")
    alismsAccessKeyId = alismsAccessKeyArray[0]
    alismsAccessKeySecret = alismsAccessKeyArray[1]
  } else {
    panic(err)
  }
}

var hmacSecret = []byte("my_secret_key")

type User struct {
  Id string `json:"id" gorethink:"id,omitempty"`
  Phone string `json:"phone" gorethink:"phone"`
  Password string `json:"password" gorethink:"password"`
}

type Result struct {
  Error bool `json:"error"`
  Message string `json:"message"`
}

var userType = graphql.NewObject(graphql.ObjectConfig{
  Name: "User",
  Fields: graphql.Fields{
    "id": &graphql.Field{
      Type: graphql.String,
    },
    "phone": &graphql.Field{
      Type: graphql.String,
    },
    "password": &graphql.Field{
      Type: graphql.String,
    },
  },
})

var resultType = graphql.NewObject(graphql.ObjectConfig{
  Name: "Result",
  Fields: graphql.Fields{
    "error": &graphql.Field{
      Type: graphql.Boolean,
    },
    "message": &graphql.Field{
      Type: graphql.String,
    },
  },
})

var createUserResultType = graphql.NewObject(graphql.ObjectConfig{
  Name: "CreateUserResult",
  Fields: graphql.Fields{
    "error": &graphql.Field{
      Type: graphql.Boolean,
    },
    "message": &graphql.Field{
      Type: graphql.String,
    },
    "token": &graphql.Field{
      Type: graphql.String,
    },
  },
})

var rootMutation = graphql.NewObject(graphql.ObjectConfig{
  Name: "Mutation",
  Fields: graphql.Fields{
    "createUser": relay.MutationWithClientMutationID(relay.MutationConfig{
      Name: "CreateUser",
      InputFields: graphql.InputObjectConfigFieldMap{
        "phone": &graphql.InputObjectFieldConfig{
          Type: graphql.NewNonNull(graphql.String),
        },
        "password": &graphql.InputObjectFieldConfig{
          Type: graphql.NewNonNull(graphql.String),
        },
        "code": &graphql.InputObjectFieldConfig{
          Type: graphql.NewNonNull(graphql.String),
        },
      },
      OutputFields: graphql.Fields{
        "createUserResult": &graphql.Field{
          Type: createUserResultType,
          Resolve: func(params graphql.ResolveParams) (interface{}, error) {
            if payload, ok := params.Source.(map[string]interface{}); ok {
              //log.Println("payload: ", payload)
              return payload, nil
            }
            return nil, nil
          },
        },
      },
      MutateAndGetPayload: func(inputMap map[string]interface{}, info graphql.ResolveInfo, ctx context.Context) (map[string]interface{}, error) {
        phone := inputMap["phone"].(string)
        //log.Println("phone: ", phone)
        password := inputMap["password"].(string)
        //log.Println("password: ", password)
        code := inputMap["code"].(string)
        //log.Println("code: ", code)
        // 校验验证码
        etcdClient, err := clientv3.New(clientv3.Config{
          DialTimeout: dialTimeout,
          Endpoints: []string{"127.0.0.1:2379"},
        })
        if err != nil {
          log.Fatalln(err.Error())
        }
        defer etcdClient.Close()
        ctx, cancel := context.WithTimeout(context.Background(), requestTimeout)
        defer cancel()
        resp, err := etcdClient.Get(ctx, phone)
        if err != nil {
          log.Printf("error: %v\n", err)
          switch err {
            case context.Canceled:
              log.Fatalf("clientv3 <= v3.3, grpc balancer calls 'Get' with an inflight client.Close: %v", err)
            case grpc.ErrClientConnClosing:
              log.Fatalf("clientv3 <= v3.3, grpc balancer calls 'Get' after client.Close: %v", err)
            default:
              log.Fatalf("bad cluster endpoints, which are not etcd servers: %v", err)
          }
          if clientv3.IsConnCanceled(err) {
            log.Fatalf("clientv3 >= v3.4, gRPC client connection is closed: %v", err)
          }
        }
        if len(resp.Kvs) == 0 {
          log.Println("验证码为空")
          return map[string]interface{}{
            "error": true,
            "message": "请先获取验证码",
          }, nil
        }
        realCode := string(resp.Kvs[0].Value)
        //log.Println("realCode: ", realCode)
        //log.Println("code == realCode: ", code == realCode)
        if code != realCode {
          log.Println("验证码输入有误")
          return map[string]interface{}{
            "error": true,
            "message": "验证码输入有误",
          }, nil
        }
        deleteResp, err := etcdClient.Delete(ctx, phone, clientv3.WithPrefix())
        if err != nil {
          log.Println("delete code error: ", err)
        }
        if int64(len(resp.Kvs)) == deleteResp.Deleted {
          log.Println("删除成功")
        }
        cancel() // delete etcd connection
        // 注册用户
        log.Println("phone: ", phone)
        filterOpt := map[string]interface{}{
          "phone": phone,
        }
        cursor, err := r.Table("user").Filter(&filterOpt).Count().Run(session)
        if err != nil {
          log.Println("count user error: ", err)
        }
        var count int
        err = cursor.One(&count)
        log.Println("count: ", count)
        if count > 0 {
          return map[string]interface{}{
            "error": true,
            "message": "手机号已注册",
          }, nil
        }
        cursor.Close()
        newUser := User{
          Phone: phone,
          Password: password,
        }
        log.Println("newUser: ", newUser)
	res, err := r.Table("user").Insert(&newUser).RunWrite(session)
        if err != nil {
          log.Printf("error: %v\n", err)
        }
        id := res.GeneratedKeys[0]
        token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
          "id": id,
        })
        tokenString, err := token.SignedString(hmacSecret)
        log.Println("tokenString: ", tokenString)
        return map[string]interface{}{
          "error": nil,
          "message": "注册成功",
          "token": tokenString,
        }, nil
      },
    }),
    "updateUser": &graphql.Field{
      Type: userType,
      Description: "Update existing user",
      Args: graphql.FieldConfigArgument{
        "id": &graphql.ArgumentConfig{
          Type: graphql.NewNonNull(graphql.String),
        },
        "password": &graphql.ArgumentConfig{
          Type: graphql.NewNonNull(graphql.String),
        },
      },
      Resolve: func(params graphql.ResolveParams) (interface{}, error) {
        id, _ := params.Args["id"].(string)
        password, _ := params.Args["password"].(string)
        cursor, err := r.Table("user").Get(id).Run(session)
        if err != nil {
          log.Printf("error: %v\n", err)
        }
        if cursor.IsNil() {
          log.Println("cursor is nil")
        }
        var originUser User
        err = cursor.One(&originUser)
        if err != nil {
          log.Printf("err: %v\n", err)
        }
        originUser.Password = password
        _, err = r.Table("user").Get(id).Update(originUser).RunWrite(session)
        if err != nil {
          log.Printf("err: %v\n", err)
        }
        return originUser, nil
      },
    },
    "getValidationCode": relay.MutationWithClientMutationID(relay.MutationConfig{
      Name: "GetValidationCode",
      InputFields: graphql.InputObjectConfigFieldMap{
        "phone": &graphql.InputObjectFieldConfig{
          Type: graphql.NewNonNull(graphql.String),
        },
      },
      OutputFields: graphql.Fields{
        "result": &graphql.Field{
          Type: resultType,
          Resolve: func(p graphql.ResolveParams) (interface{}, error) {
            if payload, ok := p.Source.(map[string]interface{}); ok {
              //log.Println("payload: ", payload)
              return payload, nil
            }
            return nil, nil
          },
        },
      },
      MutateAndGetPayload: func(inputMap map[string]interface{}, info graphql.ResolveInfo, ctx context.Context) (map[string]interface{}, error) {
        phone := inputMap["phone"].(string)
        log.Printf("phone: %v\n", phone)
        etcdClient, err := clientv3.New(clientv3.Config{
          DialTimeout: dialTimeout,
          Endpoints: []string{"127.0.0.1:2379"},
        })
        if err != nil {
          log.Fatalln(err.Error())
        }
        defer etcdClient.Close()
        ctx, cancel := context.WithTimeout(context.Background(), requestTimeout)
        defer cancel()
        resp, err := etcdClient.Get(ctx, phone)
        if err != nil {
          log.Printf("error: %v\n", err)
          switch err {
            case context.Canceled:
              log.Fatalf("clientv3 <= v3.3, grpc balancer calls 'Get' with an inflight client.Close: %v", err)
            case grpc.ErrClientConnClosing:
              log.Fatalf("clientv3 <= v3.3, grpc balancer calls 'Get' after client.Close: %v", err)
            default:
              log.Fatalf("bad cluster endpoints, which are not etcd servers: %v", err)
          }
          if clientv3.IsConnCanceled(err) {
            log.Fatalf("clientv3 >= v3.4, gRPC client connection is closed: %v", err)
          }
        }
        if len(resp.Kvs) > 0 {
          log.Println("验证码已发送过")
          return map[string]interface{}{
            "error": true,
            "message": "已经发送过验证码了",
          }, nil
        }
        dysms.HTTPDebugEnable = true
        dysms.SetACLClient(alismsAccessKeyId, alismsAccessKeySecret)
        uid, uuidErr := uuid.NewV4()
        if uuidErr != nil {
          log.Println("uuidNewV4Error: ", uuidErr)
        }
        log.Println("uid: ", uid)
        randomNumber := rand.Intn(10000)
        log.Println("randomNumber: ", randomNumber)
        //log.Println("uid.String(): ", uid.String())
        /*
        // send sms
        respSendSms, err := dysms.SendSms(uid.String(), phone, "母鸡行", "SMS_145594497", `{"code":"1234"}`).DoActionWithException()
        if err != nil {
          log.Println("send sms failed", err, respSendSms.Error())
        }
        log.Println("send sms succeed", respSendSms.GetRequestID())
        */
        // save sms
        grantResponse, err := etcdClient.Grant(context.TODO(), 5 * 60) // TTL 5 * 60 seconds 
        if err != nil {
          log.Fatal("EtcdGrantError, err: ", err)
        }
        _, err = etcdClient.Put(context.TODO(), phone, strconv.Itoa(randomNumber), clientv3.WithLease(grantResponse.ID))
        if err != nil {
          log.Printf("error: %v\n", err)
          switch err {
            case context.Canceled:
              log.Fatalf("ctx is canceled by another routine: %v", err)
            case context.DeadlineExceeded:
              log.Fatalf("ctx is attached with a deadline is exceeded: %v", err)
            case rpctypes.ErrEmptyKey:
              log.Fatalf("client-side error: %v", err)
            default:
              log.Fatalf("bad cluster endpoints, which are not etcd servers: %v", err)
          }
        }
        cancel()
        return map[string]interface{}{
          "error": nil,
          "message": "发送成功",
        }, nil
      },
    }),
  },
})

var rootQuery = graphql.NewObject(graphql.ObjectConfig{
  Name: "RootQuery",
  Fields: graphql.Fields{
    "user": &graphql.Field{
      Type: userType,
      Description: "Get single todo",
      Args: graphql.FieldConfigArgument{
        "id": &graphql.ArgumentConfig{
          Type: graphql.String,
        },
      },
      Resolve: func(params graphql.ResolveParams) (interface{}, error) {
        id, ok := params.Args["id"].(string)
        if !ok {
          return User{}, nil
        }
        cursor, err := r.Table("user").Get(id).Run(session)
        if err != nil {
          log.Printf("error: %v\n", err)
          return User{}, nil
        }
        var user User
        cursor.One(&user)
        cursor.Close()
        return user, nil
      },
    },
    "userList": &graphql.Field{
      Type: graphql.NewList(userType),
      Description: "List of users",
      Resolve: func(p graphql.ResolveParams) (interface{}, error) {
        rows, err := r.Table("user").Run(session)
        if err != nil {
          log.Printf("error: %v\n", err)
          return User{}, nil
        }
        var userList []User
        err = rows.All(&userList)
        if err != nil {
          log.Printf("error: %v\n", err)
        }
        return userList, nil
      },
    },
  },
})

var schema, _ = graphql.NewSchema(graphql.SchemaConfig{
  Query: rootQuery,
  Mutation: rootMutation,
})

type PostData struct {
  Query string `json:"query"`
  Variables map[string]interface{} `json:"variables"`
}

func GraphqlHandle(w http.ResponseWriter, r *http.Request) {
  decoder := json.NewDecoder(r.Body)
  var data PostData
  err := decoder.Decode(&data)
  if err != nil {
    panic(err)
  }
  //log.Println("data.Query: ", data.Query)
  //log.Println("data.Variables: ", data.Variables)
  res := graphql.Do(graphql.Params{
    Schema: schema,
    RequestString: data.Query,
    VariableValues: data.Variables,
  })
  if len(res.Errors) > 0 {
    log.Printf("res error: %v\n", res.Errors)
  }
  json.NewEncoder(w).Encode(res)
}
