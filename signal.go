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
)

var port = flag.String("port", ":2048", "server listening port")

func main() {
  flag.Parse()
  hub := NewHub()
  go hub.run()
  //http.Handle("/", http.FileServer(http.Dir("./client/build")))
  http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
    ServeWs(hub, w, r)
  })
  log.Printf("listen at: %s\n", *port)
  //err := http.ListenAndServe(*port, nil)
  err := http.ListenAndServeTLS(*port, "cert.pem", "key.pem", nil)
  if err != nil {
    log.Fatal("ListenAndServe error: ", err)
  }
}
