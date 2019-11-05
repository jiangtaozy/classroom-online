/*
 * Maintained by jemo from 2018.11.18 to now
 * Created by jemo on 2018.11.18 11:28:12
 * my home page 我的主页
 */

import React, { Component } from 'react'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogActions from '@material-ui/core/DialogActions'
import EditModal from './edit-modal'
import Dropzone from 'react-dropzone'
import UpdateUserMutation from '../../mutations/UpdateUserMutation'
import environment from '../../environment'
import { Link } from 'react-router-dom'

class My extends Component {

  constructor(props) {
    super(props)
    this.state = {
      showEditModal: false,
      showToast: false,
      toastMessage: '',
      textName: 'nickname',
      showBecomeAssistantDialog: false,
      showCancelAssistantDialog: false,
    }
  }

  handleTextClick = ({textName}) => {
    this.setState({
      showEditModal: true,
      textName,
    })
  }

  closeEditModal = () => {
    this.setState({
      showEditModal: false,
    })
  }

  onImageSelected = (fileKey) => {
    return (acceptedFiles, rejectedFiles) => {
      const {
        user,
        token,
      } = this.props
      if(!token) {
        this.toast('请先登录')
        return
      }
      UpdateUserMutation.commit({
        environment,
        file: acceptedFiles[0],
        fileKey,
        clientMutationId: user.id,
        token,
        onCompleted: this.onUpdateAvatarCompleted,
        onError: this.onUpdateAvatarError,
      })
    }
  }

  onUpdateAvatarCompleted = (response, errors) => {
    if(errors) {
      console.error('onUpdateAvatarCompletedError: ', errors)
      this.toast(JSON.stringify(errors))
      return
    }
    this.toast('修改成功', 1)
  }

  onUpdateAvatarError = (error) => {
    console.error('onUpdateAvatarError: ', error)
    this.toast(JSON.stringify(error))
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
      showEditModal,
      showToast,
      toastMessage,
      textName,
      showBecomeAssistantDialog,
      showCancelAssistantDialog,
    } = this.state
    const {
      user,
      token,
      location: {
        pathname
      }
    } = this.props
    const {
      nickname,
      avatar,
      introduction,
      backgroundImage,
      isAssistant,
    } = user || {}
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
        }}>
        {/* 背景图 */}
        <Dropzone
          onDrop={this.onImageSelected('backgroundImage')}>
          {({getRootProps, getInputProps}) => {
            return (
              <div
                {...getRootProps()}>
                <input
                  {...getInputProps()} />
                <img
                  style={{
                    width: '100%',
                    height: '50vh',
                    objectFit: 'cover',
                  }}
                  src={backgroundImage || '/image/one-piece.jpg'}
                  alt='背景图'
                />
              </div>
            )
          }}
        </Dropzone>
        {/* 头像和昵称　*/}
        <div
          style={{
            marginTop: -70,
            display: 'flex',
            alignItems: 'center',
          }}>
          <Dropzone
            onDrop={this.onImageSelected('avatar')}>
            {({getRootProps, getInputProps}) => {
              return (
                <div
                  {...getRootProps()}>
                  <input
                    {...getInputProps()} />
                  <img
                    style={{
                      width: 100,
                      height: 100,
                      objectFit: 'cover',
                      marginLeft: 12,
                      borderRadius: 5,
                      boxShadow: '-1px -1px 1px 0 white, 1px 1px 1px 0 white',
                    }}
                    src={avatar || '/icon/avatar-8a-128.svg'}
                    alt='头像'
                  />
                </div>
              )
            }}
          </Dropzone>
          {
            token ?
            <Button
              style={{
                fontSize: 16,
                padding: 12,
                fontWeight: 'bold',
                color: 'white',
                textShadow: '1px 1px 1px black',
              }}
              onClick={() => this.handleTextClick({
                textName: 'nickname',
              })}>
              {nickname || '点击编辑昵称'}
            </Button>:
            <Link
              to={{
                pathname: "/login",
                state: {
                  referrer: pathname
                }
              }}
              style={{
                fontSize: 16,
                padding: 12,
                fontWeight: 'bold',
                color: 'white',
                textShadow: '1px 1px 1px black',
              }}>
              登录
            </Link>
          }
        </div>
        {/* 简介 */}
        {
          token &&
          <Typography
            component='p'
            style={{
              padding: 12,
            }}>
            <Button
              style={{
                textAlign: 'left',
              }}
              onClick={() => this.handleTextClick({
                textName: 'introduction',
              })}>
              {introduction || '点击编辑简介'}
            </Button>
          </Typography>
        }
        {/* 助教 */}
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
        {/* 编辑昵称/简介 Modal */}
        <EditModal
          open={showEditModal}
          onClose={this.closeEditModal}
          user={user}
          token={token}
          textName={textName}
        />
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

export default My
