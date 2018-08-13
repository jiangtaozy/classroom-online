/*
 * Created by jemo on 2018-8-7.
 * graphql
 */

package graphql

import (
  "encoding/json"
  "log"
  "fmt"
  "net/http"
  "github.com/graphql-go/graphql"
  r "github.com/dancannon/gorethink"
)

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
}

type User struct {
  Id string `json:"id" gorethink:"id,omitempty"`
  Phone string `json:"phone" gorethink:"phone"`
  Password string `json:"password" gorethink:"password"`
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

var rootMutation = graphql.NewObject(graphql.ObjectConfig{
  Name: "RootMutation",
  Fields: graphql.Fields{
    "createUser": &graphql.Field{
      Type: userType, // the return type for this field
      Description: "Create new user",
      Args: graphql.FieldConfigArgument{
        "phone": &graphql.ArgumentConfig{
          Type: graphql.NewNonNull(graphql.String),
        },
        "password": &graphql.ArgumentConfig{
          Type: graphql.NewNonNull(graphql.String),
        },
      },
      Resolve: func(params graphql.ResolveParams) (interface{}, error) {
        phone, _ := params.Args["phone"].(string)
        password, _ := params.Args["password"].(string)
        newUser := User{
          Phone: phone,
          Password: password,
        }
	res, err := r.Table("user").Insert(&newUser).RunWrite(session)
        newUser.Id = res.GeneratedKeys[0]
        if err != nil {
          fmt.Printf("error: %v\n", err)
        }
        return newUser, nil
      },
    },
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
          fmt.Printf("error: %v\n", err)
        }
        if cursor.IsNil() {
          fmt.Println("cursor is nil")
        }
        var originUser User
        err = cursor.One(&originUser)
        if err != nil {
          fmt.Printf("err: %v\n", err)
        }
        originUser.Password = password
        _, err = r.Table("user").Get(id).Update(originUser).RunWrite(session)
        if err != nil {
          fmt.Printf("err: %v\n", err)
        }
        return originUser, nil
      },
    },
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
          fmt.Printf("error: %v\n", err)
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
          fmt.Printf("error: %v\n", err)
          return User{}, nil
        }
        var userList []User
        err = rows.All(&userList)
        if err != nil {
          fmt.Printf("error: %v\n", err)
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

func GraphqlHandle(w http.ResponseWriter, r *http.Request) {
  query := r.URL.Query().Get("query")
  res := graphql.Do(graphql.Params{
    Schema: schema,
    RequestString: query,
  })
  if len(res.Errors) > 0 {
    fmt.Printf("res error: %v\n", res.Errors)
  }
  json.NewEncoder(w).Encode(res)
}
