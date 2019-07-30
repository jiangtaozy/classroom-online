/*
 * Maintained by jemo from 2018.11.18 to now
 * Created by jemo on 2018.11.18 11:32:40
 * my school 我的学校
 */

import React, { Component } from 'react'
import { graphql, createPaginationContainer } from 'react-relay'
import Typography from '@material-ui/core/Typography'
import { Link } from 'react-router-dom'


class School extends Component {

  componentDidMount() {
    window.onscroll = () => {
      const {
        innerHeight,
        scrollY
      } = window
      if ((innerHeight + scrollY) >= document.body.offsetHeight) {
        this.loadMore()
      }
    }
  }

  loadMore = () => {
    const {
      hasMore,
      isLoading,
      loadMore,
    } = this.props.relay
    if(!hasMore() || isLoading()) {
      return
    }
    loadMore(
      2,
      error => {
        if(error) {
          console.error('schoolLoadMoreError: ', error)
        }
      }
    )
  }

  render() {
    const { viewer } = this.props
    const { userList } = viewer || {}
    const {
      edges,
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
            </Link>
          )
        })}
      </div>
    )
  }
}

export default createPaginationContainer(
  School,
  {
    viewer: graphql`
      fragment school_viewer on Viewer
      @argumentDefinitions(
        count: {type: "Int", defaultValue: 2}
        cursor: {type: "String"}
      ) {
        userList(
          first: $count
          after: $cursor
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
  },
  {
    direction: 'forward',
    getConnectionFromProps(props) {
      return props.viewer && props.viewer.userList
    },
    getFragmentVariables(prevVars, totalCount) {
      return {
        ...prevVars,
        count: totalCount,
      }
    },
    getVariables(props, {count, cursor}, fragmentVariables) {
      return {
        count,
        cursor,
      }
    },
    query: graphql`
      query schoolPaginationQuery(
        $count: Int!
        $cursor: String
      ) {
        viewer {
          ...school_viewer @arguments(count: $count, cursor: $cursor)
        }
      }
    `
  }
)
