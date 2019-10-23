/*
 * Maintained by jemo from 2019.10.23 to now
 * Created by jemo on 2019.10.23 17:19:11
 * Viewer query
 */

package graphql

import (
  "log"
  "github.com/graphql-go/relay"
  "github.com/graphql-go/graphql"
  "github.com/dancannon/gorethink"
)

func viewerQuery() *graphql.Field {
  var userConnection = relay.ConnectionDefinitions(relay.ConnectionConfig{
    Name: "UserConnection",
    NodeType: userType,
  })
  var viewerType = graphql.NewObject(graphql.ObjectConfig{
    Name: "Viewer",
    Description: "app viewer",
    Fields: graphql.Fields{
      "userList": &graphql.Field{
        Type: userConnection.ConnectionType,
        Description: "user list",
        Args: relay.ConnectionArgs,
        Resolve: userListResolve,
      },
    },
  })
  return &graphql.Field{
    Type: viewerType,
    Description: "app viewer",
    Resolve: func(p graphql.ResolveParams) (interface{}, error) {
      return Viewer{}, nil
    },
  }
}

func userListResolve(p graphql.ResolveParams) (interface{}, error) {
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
}
