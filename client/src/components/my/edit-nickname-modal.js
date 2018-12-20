/*
 * Maintained by jemo from 2018.12.10 to now
 * Created by jemo on 2018.12.10 22:21:43
 * edit nickname modal
 */

import React, { Component } from 'react'
import {
  Button,
  Modal,
  TextField,
} from '@material-ui/core'

class EditNicknameModal extends Component {
  
  constructor(props) {
    super(props)
    const { nickname } = props
    this.state = {
      nickname,
    }
  }

  // handle input change
  handleInputChange = (e) => {
    const { name, value } = e.target
    this.setState({
      [name]: value,
    })
  }

  // handle confirm button click
  handleConfirmButtonClick = () => {
    // todo
  }

  render() {
    const {
      open,
      onClose,
    } = this.props
    const {
      nickname,
    } = this.state
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
            padding: 20,
            backgroundColor: 'white',
            outline: 'none',
            display: 'flex',
            flexDirection: 'column',
          }}>
          <TextField
            label='修改昵称'
            name='nickname'
            value={nickname}
            onChange={this.handleInputChange}
            style={{
              width: 250,
            }}
          />
          <Button
            color='secondary'
            variant='outlined'
            style={{
              marginTop: 40,
              width: 250,
            }}
            onClick={this.handleConfirmButtonClick}>
            确定
          </Button>
        </div>
      </Modal>
    )
  }
}

export default EditNicknameModal
