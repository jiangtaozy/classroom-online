/*
 * Maintained by jemo from 2019.10.9 to now
 * Created by jemo on 2019.10.9 16:46:11
 * update user mutation
 */

package graphql

import (
  "log"
  "golang.org/x/net/context"
  "github.com/graphql-go/relay"
  "github.com/graphql-go/graphql"
  "github.com/dancannon/gorethink"
)

func updateUserMutation () *graphql.Field {
  return relay.MutationWithClientMutationID(relay.MutationConfig{
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
}
