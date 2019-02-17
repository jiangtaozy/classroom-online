/*
 * Maintained by jemo from 2018.11.18 to now
 * Created by jemo on 2018.11.18 11:28:12
 * my home page 我的主页
 */

import React, { Component } from 'react'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import { graphql, createFragmentContainer } from 'react-relay'
import EditNicknameModal from './edit-nickname-modal'
import Dropzone from 'react-dropzone'
import UpdateAvatarMutation from '../../mutations/UpdateAvatarMutation'
import Toast from '../toast'

class My extends Component {

  constructor(props) {
    super(props)
    this.state = {
      showEditNicknameModal: false,
      showToast: false,
      toastMessage: '',
    }
  }

  handleNicknameClick = (event) => {
    this.setState({
      showEditNicknameModal: true,
    })
  }

  closeEditNicknameModal = () => {
    this.setState({
      showEditNicknameModal: false,
    })
  }

  onAvatarSelected = (acceptedFiles, rejectedFiles) => {
    const {
      user,
      token,
      relay,
    } = this.props
    if(!token) {
      this.setState({
        showToast: true,
        toastMessage: '请先登录',
      })
      return
    }
    UpdateAvatarMutation.commit({
      environment: relay.environment,
      file: acceptedFiles[0],
      clientMutationId: user.id,
      token,
      onCompleted: this.onUpdateAvatarCompleted,
      onError: this.onUpdateAvatarError,
    })
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
      showEditNicknameModal,
      showToast,
      toastMessage,
    } = this.state
    const {
      user,
      token,
      relay,
    } = this.props
    const {
      nickname,
      avatar,
    } = user || {}
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
        }}>
        {/* 背景图 */}
        <img
          style={{
            width: '100%',
            height: '50vh',
            objectFit: 'cover',
          }}
          src='/image/one-piece.jpg'
          alt='背景图'
        />
        {/* 头像和昵称　*/}
        <div
          style={{
            marginTop: -70,
            display: 'flex',
            alignItems: 'center',
          }}>
          <Dropzone
            onDrop={this.onAvatarSelected}>
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
                    src={`http://localhost:3001/static/${avatar}` || '/icon/avatar-8a-128.svg'}
                    alt='头像'
                  />
                </div>
              )
            }}
          </Dropzone>
          <Button
            style={{
              fontSize: 16,
              padding: 12,
              fontWeight: 'bold',
              color: 'white',
              textShadow: '1px 1px 1px black',
            }}
            onClick={this.handleNicknameClick}>
            {nickname || '点击编辑昵称'}
          </Button>
        </div>
        {/* 简介 */}
        <Typography
          component='p'
          style={{
            padding: 12,
          }}>
          兰州理工大学材料工程专业研究生
        </Typography>
        {/* 编辑昵称 Modal */}
        <EditNicknameModal
          open={showEditNicknameModal}
          onClose={this.closeEditNicknameModal}
          user={user}
          token={token}
          relay={relay}
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

export default createFragmentContainer(My, {
  user: graphql`
    fragment my_user on User {
      id,
      avatar,
      nickname,
    }
  `,
})
