/*
 * Created by jemo on 2018-10-20.
 * Toast
 */

import React, { Component } from 'react'
import {
  Dialog,
  //Slide,
  DialogContent,
  DialogContentText
} from '@material-ui/core'

/*
function Transition(props) {
  return <Slide direction="right" {...props} />
}
*/

class Toast extends Component {

  render() {
    const { open, message, onClose } = this.props
    return (
      <Dialog
        open={open}
        //TransitionComponent={Transition}
        keepMounted
        onClose={onClose}
      >
        <DialogContent
          style={{
            padding: 10,
          }}>
          <DialogContentText>
            {message}
          </DialogContentText>
        </DialogContent>
      </Dialog>
    )
  }
}

export default Toast
