import React, { Component } from 'react';

class GetUserMediaDemo extends Component {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    // Feature detection
    if(this.hasGetUserMedia()) {
      //console.log('ok')
    } else {
      console.log('getUserMedia() is not supported in your browser')
    }

    // GetUserMedia
    navigator.getUserMedia = navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMeidia ||
      navigator.msGetUserMedia
    //console.log('navigator.getUserMedia: ' + navigator.getUserMedia)
    navigator.getUserMedia({
      video: true,
      audio: false,
    }, this.onMediaSuccess.bind(this), this.onMediaError)
  }

  hasGetUserMedia() {
    return !!(navigator.getUserMedia ||
      navigator.wekitGetUserMedia ||
      navigator.mozGetUserMedia ||
      navigator.msGetUserMedia)
  }

  onMediaSuccess(localMediaStream) {
    let video = this.refs.video
    video.src = window.URL.createObjectURL(localMediaStream)
    // Note: onloadedmetadata doesn't fire in Chrome when using it with getUserMedia.
    // See crbug.com/110938.
    video.onloadedmetadata = function(e) {
      console.log('onloadedmetadata e: ' + JSON.stringify(e))
    }
  }

  onMediaError(e) {
    console.log('media error: ' + JSON.stringify(e))
  }

  render() {
    return (
      <div>
        <video
          ref='video'
          autoPlay>
        </video>
      </div>
    );
  }
}

export default GetUserMediaDemo;
