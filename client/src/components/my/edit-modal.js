/*
 * Maintained by jemo from 2018.12.10 to now
 * Created by jemo on 2018.12.10 22:21:43
 * edit nickname or introduction modal
 */

import React, { Component } from 'react'
import {
  Button,
  Modal,
  TextField,
} from '@material-ui/core'
import Toast from '../toast'
import UpdateUserMutation from '../../mutations/UpdateUserMutation'
import environment from '../../environment'

const labelMap = {
  nickname: '昵称',
  introduction: '简介',
}

class EditModal extends Component {
  
  constructor(props) {
    super(props)
    const {
      user,
    } = props
    const {
      nickname = '',
      introduction = '',
    } = user || {}
    this.state = {
      nickname,
      introduction,
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
    const {
      user,
      token,
      textName,
    } = this.props
    const textLabel = labelMap[textName]
    const textValue = this.state[textName]
    const {
      id,
    } = user || {}
    if(!textValue) {
      this.setState({
        showToast: true,
        toastMessage: `请输入昵称${textLabel}`,
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
    const commitData = {
      environment,
      clientMutationId: id,
      token,
      onCompleted: this.onUpdateUserCompleted,
      onError: this.onUpdateUserError,
    }
    commitData[textName] = textValue
    UpdateUserMutation.commit(commitData)
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
      textName,
    } = this.props
    const {
      showToast,
      toastMessage,
    } = this.state
    const textLabel = labelMap[textName]
    const textValue = this.state[textName]
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
              label={`编辑${textLabel}`}
              name={textName}
              value={textValue}
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

export default EditModal
