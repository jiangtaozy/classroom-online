/*
 * Created by jemo on 2018-6-23.
 * Register
 */

import React, { Component } from 'react'
import { TextField, Button, Input, InputLabel, InputAdornment,
         FormControl, IconButton } from '@material-ui/core'
import { Visibility, VisibilityOff } from '@material-ui/icons' 

class Register extends Component {
  constructor() {
    super()
    this.state = {
      showPassword: false,
      countdown: -1,
    }
  }

  handleGetValidationCodeClick = () => {
    console.log('get code')
    this.setState({
      countdown: 60,
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

    // todo
  }

  handleShowPasswordClick = () => {
    const { showPassword } = this.state
    this.setState({
      showPassword: !showPassword,
    })
  }

  handleShowPasswordMouseDown = event => {
    event.preventDefault()
  }

  handleRegisterClick = () => {
    // todo
    console.log('register click')
  }

  render() {
    const { showPassword, countdown } = this.state
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
          type='number'
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
            type='number'
            endAdornment={
              <InputAdornment position='end'>
                { 
                  <Button
                    size='small'
                    color='primary'
                    style={{
                      whiteSpace: 'nowrap',
                    }}
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
      </div>
    )
  }
}

export default Register
