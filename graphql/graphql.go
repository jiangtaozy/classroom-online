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
  "io/ioutil"
  "golang.org/x/net/context"
  "github.com/graphql-go/relay"
  "github.com/graphql-go/graphql"
  "github.com/dancannon/gorethink"
)

// ali sms access key
var alismsAccessKeyId string
var alismsAccessKeySecret string
// rethink session
var session *gorethink.Session
const (
  dialTimeout = 2 * time.Second
  requestTimeout = 10 * time.Second
)
var userType *graphql.Object
var nodeDefinitions *relay.NodeDefinitions
var schema graphql.Schema
var hmacSecret = []byte("my_secret_key")

type User struct {
  Id string `json:"id" gorethink:"id,omitempty"`
  Phone string `json:"phone" gorethink:"phone"`
  Password string `json:"password" gorethink:"password"`
  Nickname string `json:"nickname" gorethink:"nickname"`
  Avatar string `json:"avatar" gorethink:"avatar"`
  Introduction string `json:"introduction" gorethink:"introduction"`
  BackgroundImage string `json:"backgroundImage" gorethink:"backgroundImage"`
}
type Viewer struct {
  UserList []User `json:"userList"`
}
type PostData struct {
  Query string `json:"query"`
  Variables map[string]interface{} `json:"variables"`
}

func Init() {
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
    alismsAccessKeySecret = strings.Trim(alismsAccessKeyArray[1], "\r")
  } else {
    panic(err)
  }
  nodeDefinitions = relay.NewNodeDefinitions(relay.NodeDefinitionsConfig{
    IDFetcher: func(id string, info graphql.ResolveInfo, ct context.Context) (interface{}, error) {
      resolvedID := relay.FromGlobalID(id)
      if resolvedID.Type == "User" {
        return GetUser(resolvedID.ID), nil
      }
      return nil, nil
    },
    TypeResolve: func(p graphql.ResolveTypeParams) *graphql.Object {
      switch p.Value.(type) {
      case *User:
        return userType
      }
      return nil
    },
  })
  userType = graphql.NewObject(graphql.ObjectConfig{
    Name: "User",
    Description: "user info",
    Fields: graphql.Fields{
      "id": relay.GlobalIDField("user", nil),
      "phone": &graphql.Field{
        Type: graphql.String,
      },
      "password": &graphql.Field{
        Type: graphql.String,
      },
      "nickname": &graphql.Field{
        Type: graphql.String,
      },
      "avatar": &graphql.Field{
        Type: graphql.String,
      },
      "introduction": &graphql.Field{
        Type: graphql.String,
      },
      "backgroundImage": &graphql.Field{
        Type: graphql.String,
      },
    },
    Interfaces: []*graphql.Interface{
      nodeDefinitions.NodeInterface,
    },
  })
  rootMutation := graphql.NewObject(graphql.ObjectConfig{
    Name: "Mutation",
    Fields: graphql.Fields{
      "getValidationCode": getValidationCodeMutation,
      "createUser": createUserMutation,
      "getToken": getTokenMutation,
      "updateUser": updateUserMutation(),
    },
  })
  userQuery := &graphql.Field{
    Type: userType,
    Description: "Get user info",
    Args: graphql.FieldConfigArgument{
      "token": &graphql.ArgumentConfig{
        Type: graphql.String,
      },
    },
    Resolve: func(params graphql.ResolveParams) (interface{}, error) {
      tokenString, ok := params.Args["token"].(string)
      if !ok || tokenString == "" {
        return User{}, nil
      }
      id := GetUserIdFromToken(tokenString)
      return GetUser(id), nil
    },
  }
  rootQuery := graphql.NewObject(graphql.ObjectConfig{
    Name: "RootQuery",
    Fields: graphql.Fields{
      "user": userQuery,
      "viewer": viewerQuery(),
      "node": nodeDefinitions.NodeField,
    },
  })
  schema, _ = graphql.NewSchema(graphql.SchemaConfig{
    Query: rootQuery,
    Mutation: rootMutation,
  })
}
