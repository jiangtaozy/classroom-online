/*
 * Maintained by jemo from 2018.6.23 to now
 * Created by jemo on 2018.6.23.
 * Register
 */

import React, { Component } from 'react'
import {
  TextField, Button, Input, InputLabel, InputAdornment,
  FormControl, IconButton, CircularProgress
} from '@material-ui/core'
import { Visibility, VisibilityOff } from '@material-ui/icons' 
import GetValidationCodeMutation from '../../mutations/GetValidationCodeMutation'
import environment from '../../environment'
import Toast from '../toast'
import CreateUserMutation from '../../mutations/CreateUserMutation'

const phoneRegex = /^1[3-9](\d{9})$/

class Register extends Component {
  constructor() {
    super()
    this.state = {
      showPassword: false,
      countdown: -1,
      showToast: false,
      toastMessage: '',
      showLoading: false,
      phone: '',
      validationCode: '',
      password: '',
      repeatPassword: '',
    }
  }

  // on get validation code completed
  onGetValidationCodeCompleted = (response, errors) => {
    const { getValidationCode } = response || {}
    const { result } = getValidationCode || {}
    const { error, message } = result || {}
    if(error || errors) {
      console.error('RegisterOnGetValidationCodeCompletedError, message: ', message)
      console.error('errors: ', errors)
      this.setState({
        showLoading: false,
        showToast: true,
        toastMessage: message || errors.message,
      })
      return
    }
    this.setState({
      showLoading: false,
      showToast: true,
      toastMessage: message,
      countdown: 5 * 60,
    })
    const that = this
    const intervalID = setInterval(function() {
      const { countdown } = that.state
      that.setState({
        countdown: countdown - 1,
      })
      if(countdown <= 0) {
        clearInterval(intervalID)
      }
    }, 1000)
    setTimeout(() => {
      this.setState({
        showToast: false,
      })
    }, 1000)
  }

  // on get validation code error
  onGetValidationCodeError = (error) => {
    if(error) {
      console.error('RegisterOnGetValidationCodeErrorError: ', error)
      this.setState({
        showLoading: false,
        showToast: true,
        toastMessage: error.message,
      })
    }
  }

  // get validation code
  handleGetValidationCodeClick = () => {
    const { phone } = this.state
    if(!phone) {
      this.setState({
        showToast: true,
        toastMessage: '请输入手机号',
      })
      return
    }
    if(!phoneRegex.test(phone)) {
      this.setState({
        showToast: true,
        toastMessage: '手机号格式不正确',
      })
      return
    }
    this.setState({
      showLoading: true,
    })
    GetValidationCodeMutation.commit(
      environment,
      phone.toString(),
      this.onGetValidationCodeCompleted,
      this.onGetValidationCodeError,
    )
  }

  // show password click
  handleShowPasswordClick = () => {
    const { showPassword } = this.state
    this.setState({
      showPassword: !showPassword,
    })
  }

  handleShowPasswordMouseDown = event => {
    event.preventDefault()
  }

  // on register completed
  onRegisterCompleted = (response, errors) => {
    const { createUser } = response || {}
    const { createUserResult } = createUser || {}
    const {
      error,
      message,
    } = createUserResult || {}
    if(error || errors) {
      console.error('OnRegisterCompletedError, message: ', message)
      console.error('errors: ', errors)
      this.setState({
        showLoading: false,
        showToast: true,
        toastMessage: message || JSON.stringify(errors),
      })
      return
    }
    this.setState({
      showLoading: false,
      showToast: true,
      toastMessage: message,
    })
    setTimeout(() => {
      this.setState({
        showToast: false,
      })
    }, 1000)
  }

  // on register error
  onRegisterError = (error) => {
    if(error) {
      console.error('OnRegisterError, error: ', error)
      this.setState({
        showLoading: false,
        showToast: true,
        toastMessage: error.message,
      })
    }
  }

  // register click
  handleRegisterClick = () => {
    const {
      phone,
      validationCode,
      password,
      repeatPassword,
    } = this.state
    if(!phone) {
      this.setState({
        showToast: true,
        toastMessage: '请输入手机号',
      })
      return
    }
    if(!phoneRegex.test(phone)) {
      this.setState({
        showToast: true,
        toastMessage: '手机号格式不正确',
      })
      return
    }
    if(!validationCode) {
      this.setState({
        showToast: true,
        toastMessage: '请输入验证码',
      })
      return
    }
    if(!password) {
      this.setState({
        showToast: true,
        toastMessage: '请输入密码',
      })
      return
    }
    if(!repeatPassword) {
      this.setState({
        showToast: true,
        toastMessage: '请输入重复密码',
      })
      return
    }
    if(password !== repeatPassword) {
      this.setState({
        showToast: true,
        toastMessage: '两次输入的密码不一致',
      })
      return
    }
    this.setState({
      showLoading: true,
    })
    CreateUserMutation.commit(
      environment,
      phone.toString(),
      password,
      validationCode,
      this.onRegisterCompleted,
      this.onRegisterError,
    )
  }

  // close toast
  closeToast = () => {
    this.setState({
      showToast: false,
    })
  }

  handleInputChange = (e) => {
    const { name, value } = e.target
    this.setState({
      [name]: value,
    })
  }

  render() {
    const {
      showPassword,
      countdown,
      showToast,
      toastMessage,
      showLoading,
      phone,
      validationCode,
      password,
      repeatPassword,
    } = this.state
    return(
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
        }}>
        <TextField
          label='手机号'
          name='phone'
          value={phone}
          type='number'
          onChange={this.handleInputChange}
          style={{
            width: 250,
          }}
        />
        <FormControl
          style={{
            width: 250,
          }}>
          <InputLabel htmlFor='validationCode'>
            验证码
          </InputLabel>
          <Input
            id='validationCode'
            name='validationCode'
            value={validationCode}
            type='number'
            onChange={this.handleInputChange}
            endAdornment={
              <InputAdornment position='end'>
                { 
                  <Button
                    size='small'
                    color='primary'
                    style={{
                      whiteSpace: 'nowrap',
                    }}
                    disabled={countdown >= 0}
                    onClick={this.handleGetValidationCodeClick}>
                    { countdown >= 0 ? `${countdown} 秒` : '获取验证码'}
                  </Button>
                }
              </InputAdornment>
            }
          />
        </FormControl>
        <FormControl
          style={{
            width: 250,
          }}>
          <InputLabel htmlFor='password'>
            密码
          </InputLabel>
          <Input
            id='password'
            name='password'
            value={password}
            onChange={this.handleInputChange}
            type={showPassword ? 'text' : 'password'}
            endAdornment={
              <InputAdornment position='end'>
                <IconButton
                  onClick={this.handleShowPasswordClick}
                  onMouseDown={this.handleShowPasswordMouseDown}>
                  {showPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            }
          />
        </FormControl>
        <FormControl
          style={{
            width: 250,
          }}>
          <InputLabel htmlFor='repeatPassword'>
            重复密码
          </InputLabel>
          <Input
            id='repeatPassword'
            name='repeatPassword'
            value={repeatPassword}
            onChange={this.handleInputChange}
            type={showPassword ? 'text' : 'password'}
          />
        </FormControl>
        <Button
          color='secondary'
          variant='outlined'
          style={{
            marginTop: 40,
            width: 250,
          }}
          onClick={this.handleRegisterClick}>
          立即注册
        </Button>
        <Toast
          open={showToast}
          message={toastMessage}
          onClose={this.closeToast}
        />
        { showLoading &&
          <div
            style={{
              position: 'absolute',
            }}>
            <CircularProgress />
          </div>
        }
      </div>
    )
  }
}

export default Register
