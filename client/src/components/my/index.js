/*
 * Maintained by jemo from 2018.11.18 to now
 * Created by jemo on 2018.11.18 11:28:12
 * my home page 我的主页
 */

import React, { Component } from 'react'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import EditModal from './edit-modal'
import Dropzone from 'react-dropzone'
import UpdateUserMutation from '../../mutations/UpdateUserMutation'
import environment from '../../environment'
import { Link } from 'react-router-dom'
import AssistantModule from './assistant-module'

class My extends Component {

  constructor(props) {
    super(props)
    this.state = {
      showEditModal: false,
      showToast: false,
      toastMessage: '',
      textName: 'nickname',
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

  render() {
    const {
      showEditModal,
      showToast,
      toastMessage,
      textName,
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
              padding: 10,
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
        <AssistantModule
          user={user}
          token={token}
        />
        {/* 编辑昵称/简介 Modal */}
        <EditModal
          open={showEditModal}
          onClose={this.closeEditModal}
          user={user}
          token={token}
          textName={textName}
        />
        {/* Toast */}
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

export default My
