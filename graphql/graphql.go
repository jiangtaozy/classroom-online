/*
 * Maintained by jemo from 2018.8.7 to now
 * Created by jemo on 2018.8.7
 * graphql
 */

package graphql

import (
  "log"
  "time"
  "strings"
  "net/http"
  "io/ioutil"
  "encoding/json"
  "github.com/graphql-go/graphql"
  "github.com/dancannon/gorethink"
)

// ali sms access key
var alismsAccessKeyId string
var alismsAccessKeySecret string

const (
  dialTimeout = 2 * time.Second
  requestTimeout = 10 * time.Second
)

// rethink session
var session *gorethink.Session

func InitDb() {
  var err error
  session, err = gorethink.Connect(gorethink.ConnectOpts{
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

/*
type Result struct {
  Error bool `json:"error"`
  Message string `json:"message"`
}
*/

var userType = graphql.NewObject(graphql.ObjectConfig{
  Name: "User",
  Description: "user info",
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
    "nickname": &graphql.Field{
      Type: graphql.String,
    },
  },
})

var rootMutation = graphql.NewObject(graphql.ObjectConfig{
  Name: "Mutation",
  Fields: graphql.Fields{
    "getValidationCode": getValidationCodeMutation,
    "createUser": createUserMutation,
    "getToken": getTokenMutation,
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
        cursor, err := gorethink.Table("user").Get(id).Run(session)
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
        _, err = gorethink.Table("user").Get(id).Update(originUser).RunWrite(session)
        if err != nil {
          log.Printf("err: %v\n", err)
        }
        return originUser, nil
      },
    },
  },
})

var rootQuery = graphql.NewObject(graphql.ObjectConfig{
  Name: "RootQuery",
  Fields: graphql.Fields{
    "user": userQuery,
    "userList": &graphql.Field{
      Type: graphql.NewList(userType),
      Description: "List of users",
      Resolve: func(p graphql.ResolveParams) (interface{}, error) {
        rows, err := gorethink.Table("user").Run(session)
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
