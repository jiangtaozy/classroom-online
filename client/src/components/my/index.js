/*
 * Maintained by jemo from 2018.11.18 to now
 * Created by jemo on 2018.11.18 11:28:12
 * my home page 我的主页
 */

import React, { Component } from 'react'
import Typography from '@material-ui/core/Typography'
import { graphql, QueryRenderer } from 'react-relay'
import environment from '../../environment'
import { getLastObject } from '../../indexedDB'

class My extends Component {

  constructor(props) {
    super(props)
    this.state = {
      token: '',
    }
  }

  async componentDidMount() {
    const lastUser = await getLastObject('user')
    console.log('lastUser: ', lastUser)
    const { phone, token } = lastUser || {}
    console.log('phone: ', phone)
    console.log('token: ', token)
    this.setState({
      token,
    })
  }

  render() {
    console.log('this.props: ', this.props)
    const { token } = this.state
    console.log('token: ', token)

    return (
      <QueryRenderer
        environment={environment}
        query={graphql`
          query myQuery($token: String) {
            user(token: $token) {
              nickname
            }
          }
        `}
        variables={{token}}
        render={({error, props}) => {
          console.log('error: ', error)
          console.log('props: ', props)

          if(error) {
            return <div>error!</div>
          }
          if(!props) {
            return <div>Loading...</div>
          }
          const { user } = props
          console.log('user: ', user)
          const { nickname } = user || {}
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
                <img
                  style={{
                    width: 100,
                    height: 100,
                    objectFit: 'cover',
                    marginLeft: 12,
                    borderRadius: 5,
                    boxShadow: '-1px -1px 1px 0 white, 1px 1px 1px 0 white',
                  }}
                  src='/icon/avatar-8a-128.svg'
                  alt='头像'
                />
                <div
                  style={{
                    fontSize: 16,
                    padding: 12,
                    fontWeight: 'bold',
                    color: 'white',
                    textShadow: '1px 1px 1px black',
                  }}>
                  {nickname || '点击编辑昵称'}
                </div>
              </div>
              {/* 简介 */}
              <Typography
                component='p'
                style={{
                  padding: 12,
                }}>
                兰州理工大学材料工程专业研究生
              </Typography>
            </div>
          )
        }}
      />
    )
  }
}

export default My
