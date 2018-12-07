/*
 * Maintained by jemo from 2018.11.13 to now
 * Create by jemo on 2018.11.13 07:49
 * get token mutation
 */

package graphql

import (
  "log"
  "context"
  "github.com/graphql-go/relay"
  "github.com/graphql-go/graphql"
  "github.com/dancannon/gorethink"
  "github.com/dgrijalva/jwt-go"
)

var getTokenResultType = graphql.NewObject(graphql.ObjectConfig{
  Name: "GetTokenResult",
  Fields: graphql.Fields{
    "error": &graphql.Field{
      Type: graphql.Boolean,
    },
    "message": &graphql.Field{
      Type: graphql.String,
    },
    "phone": &graphql.Field{
      Type: graphql.String,
    },
    "token": &graphql.Field{
      Type: graphql.String,
    },
  },
})

var getTokenMutation = relay.MutationWithClientMutationID(relay.MutationConfig{
  Name: "GetToken",
  InputFields: graphql.InputObjectConfigFieldMap{
    "phone": &graphql.InputObjectFieldConfig{
      Type: graphql.NewNonNull(graphql.String),
    },
    "password": &graphql.InputObjectFieldConfig{
      Type: graphql.NewNonNull(graphql.String),
    },
  },
  OutputFields: graphql.Fields{
    "getTokenResult": &graphql.Field{
      Type: getTokenResultType,
      Resolve: func(params graphql.ResolveParams) (interface{}, error) {
        if payload, ok := params.Source.(map[string]interface{}); ok {
          return payload, nil
        }
        return nil, nil
      },
    },
  },
  MutateAndGetPayload: func(inputMap map[string]interface{}, info graphql.ResolveInfo, ctx context.Context) (map[string]interface{}, error) {
    phone := inputMap["phone"].(string)
    log.Println("phone: ", phone)
    password := inputMap["password"].(string)
    log.Println("password: ", password)
    filterOpt := map[string]interface{}{
      "phone": phone,
      "password": password,
    }
    cursor, err := gorethink.Table("user").Filter(&filterOpt).Run(session)
    if err != nil {
      log.Println("get-token-mutation-count-error: ", err)
    }
    var user User
    err = cursor.One(&user)
    if err != nil {
      log.Println("err: ", err)
      return map[string]interface{}{
        "error": true,
        "message": "账号或密码错误",
      }, nil
    }
    log.Println("user: ", user)
    log.Println("user.Id: ", user.Id)
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
      "phone": phone,
      "id": user.Id,
    })
    tokenString, err := token.SignedString(hmacSecret)
    log.Println("tokenString: ", tokenString)
    cursor.Close()
    return map[string]interface{}{
      "error": nil,
      "message": "登录成功",
      "phone": phone,
      "token": tokenString,
    }, nil
  },
})
