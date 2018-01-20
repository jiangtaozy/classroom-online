/*
 * Created by jemo on 2018-1-16.
 * SDP(Session Description Protocol) signaling server.
 */

package main

import (
  "log"
  "flag"
  "net/http"
  "github.com/gorilla/websocket"
)

var port = flag.String("port", ":2048", "server listening port")

var upgrader = websocket.Upgrader{
  ReadBufferSize: 1024,
  WriteBufferSize: 1024,
  CheckOrigin: func(r *http.Request) bool {
    return true
  },
}

func main() {
  flag.Parse()
  http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
    conn, err := upgrader.Upgrade(w, r, nil)
    if err != nil {
      log.Printf("websocket.Upgrader.Upgrade error: %v\n", err)
      return
    }
    for {
      messageType, p, err := conn.ReadMessage()
      log.Printf("messageType: %d\n", messageType)
      log.Printf("p: %s\n", p)
      if err != nil {
	log.Printf("conn.ReadMessage error: %v\n", err)
	return
      }
      err = conn.WriteMessage(messageType, p)
      if err != nil {
	log.Printf("conn.WriteMessage error: %v\n", err)
	return
      }
    }
  })
  log.Printf("listen at: %s\n", *port)
  err := http.ListenAndServe(*port, nil)
  if err != nil {
    log.Fatal("ListenAndServe error: ", err)
  }
}
