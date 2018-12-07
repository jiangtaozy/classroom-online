/*
 * Maintained by jemo from 2018.11.29 to now
 * Created by jemo on 2018.11.29 21:23:19
 * user query
 */

package graphql

import (
  "fmt"
  "log"
  "github.com/graphql-go/graphql"
  "github.com/dgrijalva/jwt-go"
  "github.com/dancannon/gorethink"
)

var userQuery = &graphql.Field{
  Type: userType,
  Description: "Get user info",
  Args: graphql.FieldConfigArgument{
    "token": &graphql.ArgumentConfig{
      Type: graphql.String,
    },
  },
  Resolve: func(params graphql.ResolveParams) (interface{}, error) {
    tokenString, ok := params.Args["token"].(string)
    log.Println("tokenString: ", tokenString)
    log.Println("ok: ", ok)
    if !ok {
      return User{}, nil
    }
    token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
      if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
        return nil, fmt.Errorf("Unexpected signing method: %v", token.Header["alg"])
      }
      return hmacSecret, nil
    })
    if err != nil {
      log.Println("userQueryJwtParseError, error: ", err)
      return User{}, nil
    }
    claims, ok := token.Claims.(jwt.MapClaims);
    if  !ok || !token.Valid {
      log.Println("userQueryTokenClaimsError, not ok or token invalid")
      return User{}, nil
    }
    id := claims["id"]
    log.Println("id: ", id)

    cursor, err := gorethink.Table("user").Get(id).Run(session)
    if err != nil {
      log.Printf("error: %v\n", err)
      return User{}, nil
    }
    var user User
    cursor.One(&user)
    cursor.Close()
    log.Printf("user: %+v\n", user)
    return user, nil
  },
}
