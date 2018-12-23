/*
 * Maintained by jemo from 2018.11.13 to now
 * Created by jemo on 2018.11.13 6:49
 * create user mutation
 */

package graphql

import (
  "log"
  "context"
  "github.com/graphql-go/relay"
  "github.com/graphql-go/graphql"
  "github.com/dancannon/gorethink"
  "go.etcd.io/etcd/clientv3"
  "google.golang.org/grpc"
  "github.com/dgrijalva/jwt-go"
)

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

var createUserMutation = relay.MutationWithClientMutationID(relay.MutationConfig{
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
    cursor, err := gorethink.Table("user").Filter(&filterOpt).Count().Run(session)
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
    res, err := gorethink.Table("user").Insert(&newUser).RunWrite(session)
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
})
