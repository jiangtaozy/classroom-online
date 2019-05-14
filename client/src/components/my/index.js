/*
 * Maintained by jemo from 2018.11.18 to now
 * Created by jemo on 2018.11.18 11:28:12
 * my home page 我的主页
 */

import React, { Component } from 'react'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import EditModal from './edit-modal'
import Dropzone from 'react-dropzone'
import UpdateUserMutation from '../../mutations/UpdateUserMutation'
import Toast from '../toast'
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
        this.setState({
          showToast: true,
          toastMessage: '请先登录',
        })
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
  }

  onUpdateAvatarError = (error) => {
    console.error('onUpdateAvatarError: ', error)
    this.setState({
      showToast: true,
      toastMessage: JSON.stringify(error),
    })
  }

  closeToast = () => {
    this.setState({
      showToast: false,
    })
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
              padding: 12,
            }}>
            <Button
              onClick={() => this.handleTextClick({
                textName: 'introduction',
              })}>
              {introduction || '点击编辑简介'}
            </Button>
          </Typography>
        }
        {/* 编辑昵称/简介 Modal */}
        <EditModal
          open={showEditModal}
          onClose={this.closeEditModal}
          user={user}
          token={token}
          textName={textName}
        />
        <Toast
          open={showToast}
          message={toastMessage}
          onClose={this.closeToast}
        />
      </div>
    )
  }
}

export default My
