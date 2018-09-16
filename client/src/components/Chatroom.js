import React, { Component } from 'react'
import webrtc from 'webrtc-adapter'

class Chatroom extends Component {
  componentDidMount() {
    // WebSocket
    let webSocket = new WebSocket("wss://192.168.1.103:3000/ws")
    //let webSocket = new WebSocket("wss://destpact.com:3000/ws")
    webSocket.onopen = function(event) {
      console.log('onopen event: ', event)
    }
    webSocket.onerror = function(event) {
      console.log('onerror event: ', event)
    }
    webSocket.onclose = function(event) {
      console.log('onclose event: ', event)
    }
    const configuration = { 
      "iceServers": [
        {
          "url": "stun:destpact.com:3478"
        },
        {
          "url": "turn:destpact.com:3479"
        }
      ] 
    }
    // RTCPeerConnection
    let pc = new RTCPeerConnection(configuration)
    // send any ice candidates to the other peer
    pc.onicecandidate = ({candidate}) => {
      console.log('send ice candidate: ', {candidate})
      webSocket.send(JSON.stringify({candidate}))
    }
    // let the "negotiationneeded" event trigger offer generation
    pc.onnegotiationneeded = () => {
      pc.createOffer().then(offer => {
        return pc.setLocalDescription(offer)
      }).then(() => {
        console.log('send offer: ', {desc: pc.localDescription})
        webSocket.send(JSON.stringify({desc: pc.localDescription}))
      }).catch(err => {
        console.log('pc.onnegotiationneeded error: ', err)
      })
    }
    // once media for a remote track arrives, show it in the remote video element
    let remoteVideo = this.refs.remoteVideo
    pc.ontrack = (event) => {
      console.log('add remote track')
      // 手机刷新时需重新加载
      // don't set srcObject again if it is already set.
      //if(remoteVideo.srcObject) {
      //  return console.log('remote track is already set')
      //}
      remoteVideo.srcObject = event.streams[0]
    }
    webSocket.onmessage = function(event) {
      let {desc, candidate} = JSON.parse(event.data)
      if(desc) {
        if(desc.type == 'offer') {
          console.log('onmessage desc offer')
          pc.setRemoteDescription(desc).then(() => {
            return pc.createAnswer().then(answer => {
              return pc.setLocalDescription(answer).then(() => {
                console.log('send answer desc: ', pc.localDescription)
                webSocket.send(JSON.stringify({desc: pc.localDescription}))
              })
            })
          }).catch(err => {
            console.log('onmessage offer desc, error: ', err)
          })
        } else if(desc.type == 'answer') {
          console.log('onmessage desc answer')
          pc.setRemoteDescription(desc).catch(err => {
            console.log('pc.setRemoteDescription() , error: ', err)
          })
        } else {
          console.log('Unsupported SDP type')
        }
      } else if(candidate) {
        console.log('onmessage candidate')
        pc.addIceCandidate(candidate).catch(err => {
          console.log('pc.addIceCandidate(), error: ', err)
        })
      }
    }

    // getUserMedia
    let localVideo = this.refs.localVideo
    // get a local stream, show it in a self-view and add it to be sent
    navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    }).then(mediaStream => {
      mediaStream.getTracks().forEach(track => {
        console.log('add localVideo Track')
        pc.addTrack(track, mediaStream)
      })
      localVideo.srcObject = mediaStream
    }).catch(err => {
      console.log('getUserMedia error: ', err)
    })
  }

  render() {
    return (
      <div>
        <video
          style={{
            maxWidth: '100%',
          }}
          ref='remoteVideo'
          autoPlay>
        </video>
        <video
          style={{
            maxWidth: '100%',
          }}
          ref='localVideo'
          autoPlay
          muted>
        </video>
      </div>
    )
  }
}

export default Chatroom
