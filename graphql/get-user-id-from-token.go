/*
 * Maintained by jemo from 2019.2.16 to now
 * Created by jemo on 2019.2.16 21:44
 * get user id from token
 */

package graphql

import (
  "fmt"
  "log"
  "github.com/dgrijalva/jwt-go"
)

func GetUserIdFromToken(tokenString string) string {
  token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
    if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
      return nil, fmt.Errorf("Unexpected signing method: %v", token.Header["alg"])
    }
    return hmacSecret, nil
  })
  if err != nil {
    log.Println("updateUserMutationJwtParseError, error: ", err)
    return ""
  }
  claims, ok := token.Claims.(jwt.MapClaims);
  if  !ok || !token.Valid {
    log.Println("updateUserMutationTokenClaimsError, not ok or token invalid")
    return ""
  }
  id := claims["id"]
  return id.(string)
}
