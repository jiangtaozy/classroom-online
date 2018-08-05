package main

import (
  "fmt"
  "log"

  r "gopkg.in/gorethink/gorethink.v4"
)

func main() {
  session, err := r.Connect(r.ConnectOpts{
    Address: "localhost:28015",
  })
  if err != nil {
    log.Fatalln(err)
  }

  res, err := r.Expr("Hello World").Run(session)
  if err != nil {
    log.Fatalln(err)
  }

  var response string
  err = res.One(&response)
  if err != nil {
    log.Fatalln(err)
  }

  fmt.Println(response)
}
