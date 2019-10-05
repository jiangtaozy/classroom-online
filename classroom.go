/*
 * Maintained by jemo from 2018.1.16 to now
 * Created by jemo on 2018.1.16
 * SDP signaling server.
 * SDP: Session Description Protocol.
 */

package main

import (
  "os"
  "log"
  "flag"
  "net/http"
  "github.com/rs/cors"
  "github.com/jiangtaozy/classroom-online/signal"
  "github.com/jiangtaozy/classroom-online/graphql"
)


func main() {
  args := os.Args
  if(len(args) > 1 && args[1] == "development") {
    os.Setenv("development", "1")
  }
  graphql.Init()
  hub := signal.NewHub()
  go hub.Run()
  mux := http.NewServeMux()
  mux.Handle("/", http.FileServer(http.Dir("./client/build")))
  mux.Handle("/upload/", http.StripPrefix("/upload/", http.FileServer(http.Dir("./upload"))))
  mux.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
    signal.ServeWs(hub, w, r)
  })
  mux.HandleFunc("/graphql", graphql.GraphqlHandle)
  developmentENV := os.Getenv("development") == "1"
  var handler http.Handler
  var portString string
  var certPem string
  var keyPem string
  if developmentENV {
    c := cors.New(cors.Options{
      AllowedOrigins:   []string{"https://localhost:3000", "https://192.168.1.112:3000"},
      AllowedMethods:   []string{http.MethodGet, http.MethodPost, http.MethodDelete},
      AllowCredentials: true,
    })
    handler = c.Handler(mux)
    portString = ":3001"
    certPem = "pem/cert.pem"
    keyPem = "pem/key.pem"
  } else {
    handler = mux
    portString = ":443"
    certPem = "/etc/letsencrypt/live/destpact.com/fullchain.pem"
    keyPem = "/etc/letsencrypt/live/destpact.com/privkey.pem"
  }
  var port= flag.String("port", portString, "server listening port")
  flag.Parse()
  log.Printf("listen at https %s\n", *port)
  err := http.ListenAndServeTLS(*port, certPem, keyPem, handler)
  if err != nil {
    log.Fatal("ListenAndServe error: ", err)
  }
}
