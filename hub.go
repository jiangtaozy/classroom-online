// Copyright 2013 The Gorilla WebSocket Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

package main

import (
  "log"
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

func (h *Hub) run() {
	for {
                if len(h.clients) > 1 {
			select {
			case client := <-h.register:
                                log.Printf("register\n")
				h.clients[client] = true
			case client := <-h.unregister:
				if _, ok := h.clients[client]; ok {
                                        log.Printf("unregister\n")
					delete(h.clients, client)
					close(client.send)
				}
			case message := <-h.broadcast:
				for client := range h.clients {
                                        if message.client != client {
                                                //log.Printf("message.client != client")
                                                log.Printf("message.msg: %s\n", message.msg)
						select {
						//case client.send <- message:
						case client.send <- message.msg:
						default:
							close(client.send)
							delete(h.clients, client)
						}
                                        } else {
                                                //log.Printf("message.client == client")
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
