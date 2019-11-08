/*
 * Maintained by jemo from 2019.11.7
 * Created by jemo on 2019.11.7 14:40:36
 * Assistant Fee
 */

import React, { Component } from 'react'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'
import TextField from '@material-ui/core/TextField'
import InputAdornment from '@material-ui/core/InputAdornment'
import environment from '../../environment'
import UpdateUserMutation from '../../mutations/UpdateUserMutation'

class AssistantFee extends Component {

  constructor(props) {
    super(props)
    let {
      classFee,
    } = props
    this.state = {
      showToast: false,
      toastMessage: '',
      showDialog: false,
      editClassFee: classFee,
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

  handleDialogOpen = () => {
    this.setState({
      showDialog: true,
    })
  }

  handleDialogClose = () => {
    this.setState({
      showDialog: false,
    })
  }

  handleClassFeeChange = (event) => {
    this.setState({
      editClassFee: event.target.value
    })
  }

  handleClassFeeSubmit = () => {
    const {
      editClassFee,
    } = this.state
    const {
      token,
      userId,
    } = this.props
    UpdateUserMutation.commit({
      environment,
      clientMutationId: userId,
      token,
      classFee: editClassFee,
      onCompleted: this.onUpdateUserClassFeeCompleted,
      onError: this.onUpdateUserClassFeeError,
    })
    this.handleDialogClose()
  }

  onUpdateUserClassFeeCompleted = (response, errors) => {
    if(errors) {
      this.toast(JSON.stringify(errors))
      console.error('onUpdateUserClassFeeCompletedError: ', errors)
    } else {
      this.toast('操作成功', 1)
    }
  }

  onUpdateUserClassFeeError = (error) => {
    if(error) {
      this.toast(JSON.stringify(error))
      console.error('onUpdateUserClassFeeError: ', error)
    }
  }

  render() {
    let {
      classFee,
    } = this.props
    const {
      showToast,
      toastMessage,
      showDialog,
      editClassFee,
    } = this.state
    return (
      <div
        style={{
          padding: 10,
        }}>
        <Button
          onClick={this.handleDialogOpen}>
        课时费：{classFee || 0} 元/小时
        </Button>
        <Dialog
          open={showDialog}
          onClose={this.handleDialogClose}>
          <DialogTitle>
            设置课时费
          </DialogTitle>
          <DialogContent>
            <TextField
              label='课时费'
              type='number'
              value={editClassFee}
              onChange={this.handleClassFeeChange}
              InputProps={{
                inputProps: {
                  style: {
                    width: 160,
                  },
                },
                endAdornment: (
                  <InputAdornment
                    position='end'>
                    元/小时
                  </InputAdornment>
                )
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={this.handleDialogClose}>
              取消
            </Button>
            <Button
              onClick={this.handleClassFeeSubmit}
              color='secondary'>
              确定
            </Button>
          </DialogActions>
        </Dialog>
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
      </div>
    )
  }
}

export default AssistantFee
