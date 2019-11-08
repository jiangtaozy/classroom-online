/*
 * Maintained by jemo from 2019.11.6 to now
 * Created by jemo on 2019.11.6 16:07:21
 * Assistant Module
 */

import React, { Component } from 'react'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogActions from '@material-ui/core/DialogActions'
import UpdateUserMutation from '../../mutations/UpdateUserMutation'
import environment from '../../environment'
import AssistantFee from './assistant-fee'

class AssistantModule extends Component {

  constructor(props) {
    super(props)
    this.state = {
      showToast: false,
      toastMessage: '',
      showBecomeAssistantDialog: false,
      showCancelAssistantDialog: false,
    }
  }

  closeToast = () => {
    this.setState({
      showToast: false,
    })
  }

  toast = (toastMessage, autoHideDuration) => {
    this.setState({
      showToast: true,
      toastMessage,
    })
    if(autoHideDuration) {
      setTimeout(() => {
        this.setState({
          showToast: false,
        })
      }, autoHideDuration * 1000)
    }
  }

  handleBecomeAssistantDialogOpen = () => {
    this.setState({
      showBecomeAssistantDialog: true,
    })
  }

  handleBecomeAssistantDialogClose = () => {
    this.setState({
      showBecomeAssistantDialog: false,
    })
  }

  handleCancelAssistantDialogOpen = () => {
    this.setState({
      showCancelAssistantDialog: true,
    })
  }

  handleCancelAssistantDialogClose = () => {
    this.setState({
      showCancelAssistantDialog: false,
    })
  }

  handleBecomeAssistantButtonClick = () => {
    this.updateUserIsAssistant({
      isAssistant: true,
    })
    this.handleBecomeAssistantDialogClose()
  }

  handleCancelAssistantButtonClick = () => {
    this.updateUserIsAssistant({
      isAssistant: false,
    })
    this.handleCancelAssistantDialogClose()
  }

  updateUserIsAssistant = ({isAssistant}) => {
    const {
      user,
      token,
    } = this.props
    const {
      id,
    } = user || {}
    UpdateUserMutation.commit({
      environment,
      clientMutationId: id,
      isAssistant,
      token,
      onCompleted: this.onUpdateUserIsAssistantCompleted,
      onError: this.onUpdateUserIsAssistantError,
    })
  }

  onUpdateUserIsAssistantCompleted = (response, errors) => {
    if(errors) {
      this.toast(JSON.stringify(errors))
      console.error('onUpdateUserIsAssistantCompletedErrors: ', errors)
      return
    }
    this.toast('操作成功', 1)
  }

  onUpdateUserIsAssistantError = (error) => {
    if(error) {
      this.toast(JSON.stringify(error))
      console.error('onUpdateUserIsAssistantError: ', error)
    }
  }

  render() {
    const {
      showToast,
      toastMessage,
      showBecomeAssistantDialog,
      showCancelAssistantDialog,
    } = this.state
    const {
      user,
      token,
    } = this.props
    const {
      isAssistant,
      classFee,
      id,
    } = user || {}
    return (
      <div>
        {
          token && (isAssistant ?
            <div>
              <Button
                variant='outlined'
                style={{
                  marginLeft: 10,
                }}
                onClick={this.handleCancelAssistantDialogOpen}>
                取消助教
              </Button>
              <AssistantFee
                classFee={classFee}
                token={token}
                userId={id}
              />
            </div>:
            <div>
              <Button
                variant='outlined'
                style={{
                  marginLeft: 10,
                }}
                onClick={this.handleBecomeAssistantDialogOpen}>
                成为助教
              </Button>
            </div>
          )
        }
        <Dialog
          onClose={this.closeToast}
          open={showToast}>
          <div
            style={{
              padding: 10,
            }}>
            {toastMessage}
          </div>
        </Dialog>
        <Dialog
          open={showBecomeAssistantDialog}
          onClose={this.handleBecomeAssistantDialogClose}>
          <DialogTitle>
            成为助教老师?
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              成为助教老师，通过直播课堂为孩子们解答问题。
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={this.handleBecomeAssistantDialogClose}>
              取消
            </Button>
            <Button
              color='secondary'
              autoFocus
              onClick={this.handleBecomeAssistantButtonClick}>
              确定
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={showCancelAssistantDialog}
          onClose={this.handleCancelAssistantDialogClose}>
          <DialogTitle>
            取消助教老师身份?
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              取消助教老师身份，不再进行课堂直播
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={this.handleCancelAssistantDialogClose}>
              取消
            </Button>
            <Button
              color='secondary'
              autoFocus
              onClick={this.handleCancelAssistantButtonClick}>
              确定
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    )
  }
}

export default AssistantModule
