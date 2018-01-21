import React, { Component } from 'react'
import webrtc from 'webrtc-adapter'

class Chatroom extends Component {
  componentDidMount() {
    //console.log('webrtc: ', webrtc)
    //console.log('browserDetails: ', webrtc.browserDetails)
    // WebSocket
    let webSocket = new WebSocket("ws://localhost:2048")
    webSocket.onopen = function(event) {
      webSocket.send(JSON.stringify({hello: 'world'}))
      console.log('onopen event: ', event)
    }
    webSocket.onerror = function(event) {
      console.log('onerror event: ', event)
    }
    webSocket.onclose = function(event) {
      console.log('onclose event: ', event)
    }

    // RTCPeerConnection
    let pc = new RTCPeerConnection(null)
    // send any ice candidates to the other peer
    pc.onicecandidate = ({candidate}) => {
      console.log('pc.onicecandidate is called')
      console.log('webSocket.send, {candidate}: ', {candidate})
      webSocket.send(JSON.stringify({candidate}))
    }
    // let the "negotiationneeded" event trigger offer generation
    pc.onnegotiationneeded = () => {
      console.log('pc.onnegotiationneeded is called')
      pc.createOffer().then(offer => {
        console.log('pc.createOffer offer: ', offer)
        return pc.setLocalDescription(offer)
      }).then(() => {
        console.log('webSocket.send: ', JSON.stringify({desc: pc.localDescription}))
        webSocket.send(JSON.stringify({desc: pc.localDescription}))
        //webSocket.send(JSON.stringify({hello: 'what'}))
      }).catch(err => {
        console.log('pc.onnegotiationneeded error: ', err)
      })
    }
    // once media for a remote track arrives, show it in the remote video element
    let remoteVideo = this.refs.remoteVideo
    pc.ontrack = (event) => {
      console.log('pc.ontrack is called')
      console.log('event: ', event)
      // don't set srcObject again if it is already set.
      if(remoteVideo.srcObject) return
      remoteVideo.srcObject = event.streams[0]
    }
    webSocket.onmessage = function(event) {
      console.log('onmessage event: ', event);
      let {desc, candidate} = JSON.parse(event.data)
      console.log('event.data: ', event.data)
      if(desc) {
        if(desc.type == 'offer') {
          console.log('desc.type == offer')
          pc.setRemoteDescription(desc).then(() => {
            return pc.createAnswer().then(answer => {
              return pc.setLocalDescription(answer).then(() => {
                webSocket.send(JSON.stringify({desc: pc.localDescription}))
              })
            })
          }).catch(err => {
            console.log('onmessage desc.type == offer, error: ', err)
          })
        } else if(desc.type == 'answer') {
          console.log('desc.type == answer')
          pc.setRemoteDescription(desc).catch(err => {
            console.log('pc.setRemoteDescription() , error: ', err)
          })
        } else {
          console.log('Unsupported SDP type')
        }
      } else if(candidate) {
        console.log('pc.addIceCandidate(candidate)')
        pc.addIceCandidate(candidate).catch(err => {
          console.log('pc.addIceCandidate(), error: ', err)
        })
      }
    }

    // getUserMedia
    console.log('this.refs: ', this.refs)
    let localVideo = this.refs.localVideo
    // get a local stream, show it in a self-view and add it to be sent
    navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    }).then(mediaStream => {
      console.log('navigator.mediaDevices.getUserMedia, mediaStream : ', mediaStream)
      mediaStream.getTracks().forEach(track => {
        console.log('pc.addTrack(), track: ', track)
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
