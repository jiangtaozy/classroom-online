/*
 * Maintained by jemo from 2018.8.6 to now
 * Created by jemo on 2018.8.6 22:35:47
 */

package signal

import (
  //"log"
)

// Message, include message and client
type Message struct {
  // client
  client *Client
  msg []byte
}

// hub maintains the set of active clients and broadcasts messages to the
// clients.
type Hub struct {
  // Registered clients.
  clients map[*Client]bool
  // Inbound messages from the clients.
  // broadcast chan []byte
  broadcast chan *Message
  // Register requests from the clients.
  register chan *Client
  // Unregister requests from clients.
  unregister chan *Client
}

func NewHub() *Hub {
  return &Hub{
    // broadcast:  make(chan []byte),
    broadcast:  make(chan *Message),
    register:   make(chan *Client),
    unregister: make(chan *Client),
    clients:    make(map[*Client]bool),
  }
}

func (h *Hub) Run() {
  for {
    if len(h.clients) > 1 {
      select {
      case client := <-h.register:
        h.clients[client] = true
      case client := <-h.unregister:
        if _, ok := h.clients[client]; ok {
          delete(h.clients, client)
          close(client.send)
        }
      case message := <-h.broadcast:
        for client := range h.clients {
          if message.client != client &&
            message.client.teacherId == client.teacherId {
            select {
            case client.send <- message.msg:
            default:
              close(client.send)
              delete(h.clients, client)
            }
          } else {
            // do nothing
          }
        }
      }
    } else {
      select {
      case client := <-h.register:
        h.clients[client] = true
      case client := <-h.unregister:
        if _, ok := h.clients[client]; ok {
          delete(h.clients, client)
          close(client.send)
        }
      }
    }
  }
}
