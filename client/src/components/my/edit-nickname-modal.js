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
import Toast from '../toast'
import UpdateUserMutation from '../../mutations/UpdateUserMutation'

class EditNicknameModal extends Component {
  
  constructor(props) {
    super(props)
    const { user } = props
    const { nickname } = user || {}
    this.state = {
      nickname,
      showToast: false,
      toastMessage: '',
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
    const { nickname } = this.state
    const {
      token,
      relay,
      user,
    } = this.props
    const {
      id,
    } = user || {}
    if(!nickname) {
      this.setState({
        showToast: true,
        toastMessage: '请输入昵称',
      })
      return
    }
    if(!token) {
      this.setState({
        showToast: true,
        toastMessage: '请先登录',
      })
      return
    }
    UpdateUserMutation.commit({
      environment: relay.environment,
      nickname,
      id,
      token,
      onCompleted: this.onUpdateUserCompleted,
      onError: this.onUpdateUserError,
    })
  }

  // on update user completed
  onUpdateUserCompleted = (response, errors) => {
    if(errors) {
      console.error('OnUpdateUserCompletedError, errors: ', errors)
      this.setState({
        showToast: true,
        toastMessage: JSON.stringify(errors),
      })
      return
    }
    this.setState({
      showToast: true,
      toastMessage: '修改成功',
    })
    setTimeout(() => {
      this.setState({
        showToast: false,
      })
    }, 1000)
    const { onClose } = this.props
    onClose()
  }

  // on update user error
  onUpdateUserError = (error) => {
    if(error) {
    console.error('edit-nickname-modal-onUpdateUserError, error: ', error)
      this.setState({
        showToast: true,
        toastMessage: error.message,
      })
    }
  }

  // clost toast
  closeToast = () => {
    this.setState({
      showToast: false,
    })
  }

  render() {
    const {
      open,
      onClose,
    } = this.props
    const {
      nickname,
      showToast,
      toastMessage,
    } = this.state
    return (
      <div>
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
        <Toast
          open={showToast}
          message={toastMessage}
          onClose={this.closeToast}
        />
      </div>
    )
  }
}

export default EditNicknameModal
