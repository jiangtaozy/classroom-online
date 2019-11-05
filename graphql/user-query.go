/*
 * Maintained by jemo from 2019.10.23 to now
 * Created by jemo on 2019.10.23 17:41:15
 * User query
 */

package graphql

import (
  "golang.org/x/net/context"
  "github.com/graphql-go/relay"
  "github.com/graphql-go/graphql"
)

type User struct {
  Id string `json:"id" gorethink:"id,omitempty"`
  Phone string `json:"phone" gorethink:"phone"`
  Password string `json:"password" gorethink:"password"`
  Nickname string `json:"nickname" gorethink:"nickname"`
  Avatar string `json:"avatar" gorethink:"avatar"`
  Introduction string `json:"introduction" gorethink:"introduction"`
  BackgroundImage string `json:"backgroundImage" gorethink:"backgroundImage"`
  IsAssistant bool `json:"isAssistant" gorethink:"isAssistant"`
}

var userType *graphql.Object
var nodeDefinitions *relay.NodeDefinitions

func userQuery() *graphql.Field {
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
      "isAssistant": &graphql.Field{
        Type: graphql.Boolean,
      },
    },
    Interfaces: []*graphql.Interface{
      nodeDefinitions.NodeInterface,
    },
  })
  return &graphql.Field{
    Type: userType,
    Description: "Get user info",
    Args: graphql.FieldConfigArgument{
      "token": &graphql.ArgumentConfig{
        Type: graphql.String,
      },
      "id": &graphql.ArgumentConfig{
        Type: graphql.String,
      },
    },
    Resolve: func(params graphql.ResolveParams) (interface{}, error) {
      id, ok := params.Args["id"].(string)
      if ok && id != "" {
        resolvedID := relay.FromGlobalID(id)
        return GetUser(resolvedID.ID), nil
      }
      tokenString, ok := params.Args["token"].(string)
      if !ok || tokenString == "" {
        return User{}, nil
      }
      userId := GetUserIdFromToken(tokenString)
      return GetUser(userId), nil
    },
  }
}
