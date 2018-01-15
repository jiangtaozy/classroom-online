import React, { Component } from 'react'

class Chatroom extends Component {
  render() {
    return (
      <div>
        <video
          ref='localVideo'
          autoPlay
          muted>
        </video>
        <video
          ref='remoteVideo'
          autoPlay>
        </video>
      </div>
    )
  }
}

export default Chatroom
