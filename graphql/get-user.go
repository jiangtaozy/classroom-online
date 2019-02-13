/*
 * Maintained by jemo from 2019.2.13 to now
 * Created by jemo on 2019.2.13
 * get user info
 */

package graphql

import (
  "log"
  "github.com/dancannon/gorethink"
)

func GetUser(id string) User {
  cursor, err := gorethink.Table("user").Get(id).Run(session)
  if err != nil {
    log.Printf("getUserError: %v\n", err)
    return User{}
  }
  var user User
  cursor.One(&user)
  cursor.Close()
  return user
}
