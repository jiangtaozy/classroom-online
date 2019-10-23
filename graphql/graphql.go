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
var viewerType *graphql.Object
var nodeDefinitions *relay.NodeDefinitions
var userConnection *relay.GraphQLConnectionDefinitions
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
  userConnection = relay.ConnectionDefinitions(relay.ConnectionConfig{
    Name: "UserConnection",
    NodeType: userType,
  })
  viewerType = graphql.NewObject(graphql.ObjectConfig{
    Name: "Viewer",
    Description: "app viewer",
    Fields: graphql.Fields{
      "userList": &graphql.Field{
        Type: userConnection.ConnectionType,
        Description: "user list",
        Args: relay.ConnectionArgs,
        Resolve: func(p graphql.ResolveParams) (interface{}, error) {
          args := relay.NewConnectionArguments(p.Args)
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
          userSlice := make([]interface{}, len(userList))
          uploadFilePath := GetUploadFilePath()
          for i, user := range userList {
            if(len(user.Avatar) > 0) {
              user.Avatar = uploadFilePath + user.Avatar
            }
            if(len(user.BackgroundImage) > 0) {
              user.BackgroundImage = uploadFilePath + user.BackgroundImage
            }
            userSlice[i] = user
          }
          return relay.ConnectionFromArray(userSlice, args), nil
        },
      },
    },
  })
  updateUserMutation := relay.MutationWithClientMutationID(relay.MutationConfig{
    Name: "UpdateUser",
    InputFields: graphql.InputObjectConfigFieldMap{
      "token": &graphql.InputObjectFieldConfig{
        Type: graphql.NewNonNull(graphql.String),
      },
      "nickname": &graphql.InputObjectFieldConfig{
        Type: graphql.String,
      },
      "avatar": &graphql.InputObjectFieldConfig{
        Type: graphql.String,
      },
      "introduction": &graphql.InputObjectFieldConfig{
        Type: graphql.String,
      },
      "backgroundImage": &graphql.InputObjectFieldConfig{
        Type: graphql.String,
      },
    },
    OutputFields: graphql.Fields{
      "user": &graphql.Field{
        Type: userType,
        Description: "user info",
        Resolve: func(params graphql.ResolveParams) (interface{}, error) {
          if payload, ok := params.Source.(map[string]interface{}); ok {
            return GetUser(payload["id"].(string)), nil
          }
          return nil, nil
        },
      },
    },
    MutateAndGetPayload: func(inputMap map[string]interface{}, info graphql.ResolveInfo, ctx context.Context) (map[string]interface{}, error) {
      tokenString := inputMap["token"].(string)
      id := GetUserIdFromToken(tokenString)
      nickname := inputMap["nickname"]
      avatar := inputMap["avatar"]
      introduction := inputMap["introduction"]
      backgroundImage := inputMap["backgroundImage"]
      user := make(map[string]interface{})
      if nickname != nil {
        user["nickname"] = nickname
      }
      if avatar != nil {
        user["avatar"] = avatar
      }
      if introduction != nil {
        user["introduction"] = introduction
      }
      if backgroundImage != nil {
        user["backgroundImage"] = backgroundImage
      }
      updateResponse, err := gorethink.Table("user").Get(id).Update(user).RunWrite(session)
      if err != nil {
        log.Println("updateUserMutationUpdateError, error: ", err)
        return nil, nil
      }
      if updateResponse.Errors != 0 {
        log.Printf("updateUserMutationUpdateResponseError, updateResponse: %+v\n", updateResponse)
        return nil, nil
      }
      return map[string]interface{} {
        "id": id,
      }, nil
    },
  })
  rootMutation := graphql.NewObject(graphql.ObjectConfig{
    Name: "Mutation",
    Fields: graphql.Fields{
      "getValidationCode": getValidationCodeMutation,
      "createUser": createUserMutation,
      "getToken": getTokenMutation,
      "updateUser": updateUserMutation,
    },
  })
  rootQuery := graphql.NewObject(graphql.ObjectConfig{
    Name: "RootQuery",
    Fields: graphql.Fields{
      "user": &graphql.Field{
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
      },
      "viewer": &graphql.Field{
        Type: viewerType,
        Description: "app viewer",
        Resolve: func(p graphql.ResolveParams) (interface{}, error) {
          return Viewer{}, nil
        },
      },
      "node": nodeDefinitions.NodeField,
    },
  })
  schema, _ = graphql.NewSchema(graphql.SchemaConfig{
    Query: rootQuery,
    Mutation: rootMutation,
  })
}
