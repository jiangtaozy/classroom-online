/*
 * Created by jemo on 2018-1-16.
 * SDP signaling server.
 * SDP: Session Description Protocol.
 */

package main

import (
  "log"
  "flag"
  "net/http"
  "github.com/rs/cors"
  "github.com/jiangtaozy/classroom-online/signal"
  "github.com/jiangtaozy/classroom-online/graphql"
)

var port = flag.String("port", ":3001", "server listening port")

func main() {
  graphql.InitDb()
  flag.Parse()
  hub := signal.NewHub()
  go hub.Run()
  mux := http.NewServeMux()
  mux.Handle("/", http.FileServer(http.Dir("./client/build")))
  mux.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
    signal.ServeWs(hub, w, r)
  })
  mux.HandleFunc("/graphql", graphql.GraphqlHandle)
  handler := cors.Default().Handler(mux)
  log.Printf("listen at %s\n", *port)
  err := http.ListenAndServe(*port, handler)
  //err := http.ListenAndServeTLS(*port, "pem/cert.pem", "pem/key.pem", nil)
  if err != nil {
    log.Fatal("ListenAndServe error: ", err)
  }
}
