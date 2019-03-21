/*
 * Maintained by jemo from 2018.1.16 to now
 * Created by jemo on 2018.1.16
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
  graphql.Init()
  flag.Parse()
  hub := signal.NewHub()
  go hub.Run()
  mux := http.NewServeMux()
  mux.Handle("/", http.FileServer(http.Dir("./client/build")))
  mux.Handle("/upload/", http.StripPrefix("/upload/", http.FileServer(http.Dir("./upload"))))
  mux.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
    signal.ServeWs(hub, w, r)
  })
  mux.HandleFunc("/graphql", graphql.GraphqlHandle)
  c := cors.New(cors.Options{
    AllowedOrigins:   []string{"https://localhost:3000", "https://192.168.1.106:3000"},
    AllowedMethods:   []string{http.MethodGet, http.MethodPost, http.MethodDelete},
    AllowCredentials: true,
  })
  handler := c.Handler(mux)
  log.Printf("listen at https %s\n", *port)
  //err := http.ListenAndServeTLS(*port, "/etc/letsencrypt/live/destpact.com/fullchain.pem", "/etc/letsencrypt/live/destpact.com/privkey.pem", handler)
  err := http.ListenAndServeTLS(*port, "pem/cert.pem", "pem/key.pem", handler)
  if err != nil {
    log.Fatal("ListenAndServe error: ", err)
  }
}
