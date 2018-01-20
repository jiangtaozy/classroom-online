import React, { Component } from 'react'

class Chatroom extends Component {
  componentDidMount() {
    let webSocket = new WebSocket("ws://localhost:2048");
    webSocket.onopen = function(event) {
      webSocket.send('hello');
      console.log('onopen event: ', event);
    }
    webSocket.onerror = function(event) {
      console.log('onerror event: ', event);
    }
    webSocket.onmessage = function(event) {
      console.log('onmessage event: ', event);
    }
  }

  render() {
    return (
      <div>
        <video
          ref='remoteVideo'
          autoPlay>
        </video>
        <video
          ref='localVideo'
          autoPlay
          muted>
        </video>
      </div>
    )
  }
}

export default Chatroom
