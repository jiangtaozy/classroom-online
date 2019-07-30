/*
 * Maintained by jemo from 2018.11.13 to now
 * Created by jemo on 2018.11.13 07:06
 * get validation code mutation
 */

package graphql

import (
  "log"
  "strconv"
  "context"
  "math/rand"
  "github.com/graphql-go/relay"
  "github.com/graphql-go/graphql"
  "github.com/GiterLab/aliyun-sms-go-sdk/dysms"
  "github.com/satori/go.uuid"
  "go.etcd.io/etcd/clientv3"
  "go.etcd.io/etcd/etcdserver/api/v3rpc/rpctypes"
  "google.golang.org/grpc"
)

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

var getValidationCodeMutation = relay.MutationWithClientMutationID(relay.MutationConfig{
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
    uid := uuid.NewV4()
    randomNumber := rand.Intn(10000)
    log.Println("randomNumber: ", randomNumber)
    log.Println("uid.String(): ", uid.String())
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
})
