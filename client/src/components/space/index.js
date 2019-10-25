/*
 * Maintained by jemo from 2019.10.8 to now
 * Created by jemo on 2019.10.8 16:57:24
 * User Space 用户空间
 */

import React, {
  Component,
} from 'react'
import {
  graphql,
  QueryRenderer,
} from 'react-relay'
import Typography from '@material-ui/core/Typography'
import environment from '../../environment'

class Space extends Component {
  render() {
    const {
      match: {
        params: {
          id,
        },
      },
    } = this.props
    const query = graphql`
      query spaceQuery($id: String) {
        user(id: $id) {
          id,
          avatar,
          nickname,
          introduction,
          backgroundImage
        }
      }
    `
    const render = ({error, props}) => {
      if(error) {
        return <div>error!</div>
      }
      if(!props) {
        return <div>Loading...</div>
      }
      const {
        user,
      } = props
      const {
        avatar,
        backgroundImage,
        introduction,
        nickname,
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
              height: 300,
              objectFit: 'cover',
            }}
            src={backgroundImage || '/image/one-piece.jpg'}
            alt='背景图'
          />
          {/* 头像 */}
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
              src={avatar || '/icon/avatar-8a-128.svg'}
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
              {nickname}
            </div>
          </div>
          {/* 简介 */}
          <Typography
            component='p'
            style={{
              padding: 12,
            }}>
            {introduction}
          </Typography>
        </div>
      )
    }
    return (
      <QueryRenderer
        environment={environment}
        query={query}
        variables={{id}}
        render={render}
      />
    )
  }
}

export default Space
