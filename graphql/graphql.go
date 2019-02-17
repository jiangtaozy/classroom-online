/*
 * Maintained by jemo from 2018.8.7 to now
 * Created by jemo on 2018.8.7
 * graphql
 */

package graphql

import (
  "io"
  "os"
  "log"
  "time"
  "strings"
  "net/http"
  "io/ioutil"
  "encoding/json"
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
    alismsAccessKeySecret = alismsAccessKeyArray[1]
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
    },
    Interfaces: []*graphql.Interface{
      nodeDefinitions.NodeInterface,
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
      tokenString, ok := inputMap["token"].(string)
      if !ok {
        return map[string]interface{} {
          "error": true,
          "message": "token type error!",
        }, nil
      }
      nickname := inputMap["nickname"]
      id := GetUserIdFromToken(tokenString)
      var user = map[string]interface{}{
        "nickname": nickname,
      }
      updateResponse, err := gorethink.Table("user").Get(id).Update(user).RunWrite(session)
      if err != nil {
        log.Println("updateUserMutationUpdateError, error: ", err)
        return map[string]interface{} {
          "error": true,
          "message": "update error!",
        }, nil
      }
      if updateResponse.Errors != 0 {
        log.Printf("updateUserMutationUpdateResponseError, updateResponse: %+v\n", updateResponse)
        return map[string]interface{} {
          "error": true,
          "message": "update error!",
        }, nil
      }
      return map[string]interface{} {
        "id": id,
      }, nil
    },
  })
  updateAvatarMutation := relay.MutationWithClientMutationID(relay.MutationConfig{
    Name: "UpdateAvatar",
    InputFields: graphql.InputObjectConfigFieldMap{
      "token": &graphql.InputObjectFieldConfig{
        Type: graphql.NewNonNull(graphql.String),
      },
      "filename": &graphql.InputObjectFieldConfig{
        Type: graphql.NewNonNull(graphql.String),
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
      tokenString, ok := inputMap["token"].(string)
      filename, ok := inputMap["filename"].(string)
      if !ok {
        log.Println("updateAvatarMutationInputMapError")
        return nil, nil
      }
      id := GetUserIdFromToken(tokenString)
      var user = map[string]interface{}{
        "avatar": filename,
      }
      updateResponse, err := gorethink.Table("user").Get(id).Update(user).RunWrite(session)
      if err != nil {
        log.Println("updateAvatarMutationUpdateError, error: ", err)
        return nil, nil
      }
      if updateResponse.Errors != 0 {
        log.Printf("updateAvatarMutationUpdateResponseError, updateResponse: %+v\n", updateResponse)
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
      "updateAvatar": updateAvatarMutation,
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
      "node": nodeDefinitions.NodeField,
    },
  })
  schema, _ = graphql.NewSchema(graphql.SchemaConfig{
    Query: rootQuery,
    Mutation: rootMutation,
  })
}

func GraphqlHandle(w http.ResponseWriter, r *http.Request) {
  contentType := r.Header.Get("Content-Type")
  contentTypeKey := strings.Split(contentType, ";")[0]
  var data PostData
  if(contentTypeKey == "application/json") {
    decoder := json.NewDecoder(r.Body)
    err := decoder.Decode(&data)
    if err != nil {
      log.Println("GraphqlHandleDecodeError, err: ", err)
      panic(err)
    }
  } else {
    r.ParseMultipartForm(32 << 20) // 32M
    multipartForm := r.MultipartForm
    data.Query = multipartForm.Value["query"][0]
    var variables map[string]interface {}
    err := json.Unmarshal([]byte(multipartForm.Value["variables"][0]), &variables)
    if err != nil {
      log.Println("GraphqlHandleJsonUnmarshalError: ", err)
    }
    data.Variables = variables
    file, handler, err := r.FormFile("file")
    if err != nil {
      log.Println("GraphqlHandlerGetFileError: ", err)
    }
    defer file.Close()
    input := data.Variables["input"].(map[string]interface{})
    input["filename"] = handler.Filename
    f, err := os.OpenFile("./public/" + handler.Filename, os.O_WRONLY|os.O_CREATE, 0666)
    if err != nil {
      log.Println("GraphqlHandlerOpenFileError: ", err)
    }
    defer f.Close()
    io.Copy(f, file)
  }
  res := graphql.Do(graphql.Params{
    Schema: schema,
    RequestString: data.Query,
    VariableValues: data.Variables,
  })
  if len(res.Errors) > 0 {
    log.Printf("GraphqlHandleResError, res.Errors: %v\n", res.Errors)
  }
  json.NewEncoder(w).Encode(res)
}
