/*
 * Maintained by jemo from 2018.11.18 to now
 * Created by jemo on 2018.11.18 11:32:40
 * my school 我的学校
 */

import React, { Component } from 'react'
import { graphql, createFragmentContainer } from 'react-relay'
import Typography from '@material-ui/core/Typography'
import { Link } from 'react-router-dom'

class School extends Component {
  render() {
    const { viewer } = this.props
    const { userList } = viewer || {}
    const {
      edges,
      //pageInfo,
    } = userList || {}
    return (
      <div>
        {/* 教师列表 */}
        {edges.map((edge, index) => {
          const { node } = edge || {}
          const {
            id,
            avatar,
            nickname,
            introduction,
            backgroundImage,
          } = node || {}
          return (
            <Link
              to={`/classroom/${id}`}
              key={index}
              style={{
                display: 'flex',
                flexDirection: 'column',
                textDecoration: 'none',
              }}>
              {/* 背景图 */}
              <img
                style={{
                  width: '100%',
                  height: 300,
                  objectFit: 'cover',
                }}
                src={backgroundImage}
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
                  src={avatar}
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
            </Link>
          )
        })}
      </div>
    )
  }
}

export default createFragmentContainer(School, {
  viewer: graphql`
    fragment school_viewer on Viewer {
      userList(
        first: 2147483647
      ) @connection(key: "school_userList") {
        edges {
          node {
            id,
            avatar,
            nickname,
            introduction,
            backgroundImage,
          }
        }
      }
    }
  `,
})
