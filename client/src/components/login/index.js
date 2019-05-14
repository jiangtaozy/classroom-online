/*
 * Maintained by jemo from 2018.11.7 to now
 * Created by jemo on 2018.11.7
 * Login
 */

import React, { Component } from 'react'
import {
  TextField,
  FormControl,
  Input,
  InputLabel,
  InputAdornment,
  IconButton,
  Button,
  CircularProgress,
} from '@material-ui/core'
import {
  Visibility,
  VisibilityOff,
} from '@material-ui/icons'
import Toast from '../toast'
import GetTokenMutation from '../../mutations/GetTokenMutation'
import environment from '../../environment'
import { upsert } from '../../indexedDB'
import { Link } from 'react-router-dom'

const phoneRegex = /^1[3-9](\d{9})$/

class Login extends Component {
  constructor() {
    super()
    this.state = {
      //phone: '',
      phone: '18794769375',
      //password: '',
      password: '123456',
      showPassword: false,
      showToast: false,
      toastMessage: '',
      showLoading: false,
    }
  }

  // on login completed
  onLoginCompleted = async (response, errors) => {
    const { getToken } = response || {}
    const { getTokenResult } = getToken || {}
    const { error, message, phone, token } = getTokenResult || {}
    if(error || errors) {
      console.error('OnLoginCompletedError, errors: ', errors)
      console.error('OnLoginCompletedError, message: ', message)
      this.setState({
        showToast: true,
        toastMessage: message || JSON.stringify(errors),
      })
      return
    }
    this.setState({
      showToast: true,
      toastMessage: message,
    })
    try {
      await upsert('user', phone, {
        phone,
        token,
      })
    }
    catch(error) {
      console.error('LoginOnLoginCompletedCatchError, error: ', error)
    }
    await this.props.refreshToken()
    const {
      history,
      location: {
        state
      }
    } = this.props
    const {
      referrer
    } = state || {}
    history.replace(referrer || '/')
  }

  // on login error
  onLoginError = (error) => {
    if(error) {
      console.error('OnLoginError, error: ', error)
      this.setState({
        showToast: true,
        toastMessage: error.message,
      })
    }
  }

  // handle login click
  handleLoginClick = () => {
    const {
      phone,
      password,
    } = this.state;
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
    if(!password) {
      this.setState({
        showToast: true,
        toastMessage: '请输入密码',
      })
      return
    }
    GetTokenMutation.commit({
      environment,
      phone: phone.toString(),
      password,
      onCompleted: this.onLoginCompleted,
      onError: this.onLoginError,
    })
  }

  // input change
  handleInputChange = (e) => {
    const { name, value } = e.target
    this.setState({
      [name]: value,
    })
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

  // close toast
  closeToast = () => {
    this.setState({
      showToast: false,
    })
  }

  render() {
    const {
      phone,
      password,
      showPassword,
      showToast,
      toastMessage,
      showLoading,
    } = this.state
    return (
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
        <Button
          color='secondary'
          variant='outlined'
          style={{
            marginTop: 40,
            width: 250,
          }}
          onClick={this.handleLoginClick}>
          立即登录
        </Button>
        <Link
          to='/register'
          style={{
            fontSize: 16,
            color: '#636e72',
            textDecoration: 'none',
            marginTop: 40,
          }}>
          注册
        </Link>
        <Toast
          open={showToast}
          message={toastMessage}
          onClose={this.closeToast}
        />
        {showLoading &&
          <div
            style={{
              position: 'absolute',
            }}>
            <CircularProgress />
          </div>
        }
      </div>
    );
  }
}

export default Login
