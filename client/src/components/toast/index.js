/*
 * Maintained by jemo from 2018.10.10 to now
 * Created by jemo on 2018.10.20
 * Toast
 */

import React, { Component } from 'react'
import {
  Modal,
} from '@material-ui/core'

class Toast extends Component {

  render() {
    const {
      open,
      message,
      onClose,
    } = this.props
    return (
      <Modal
        open={open}
        onClose={onClose}
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <div
          style={{
            padding: 10,
            backgroundColor: 'white',
            outline: 'none',
          }}>
          {message}
        </div>
      </Modal>
    )
  }
}

export default Toast
