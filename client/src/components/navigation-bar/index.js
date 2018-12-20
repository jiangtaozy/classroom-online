/*
 * Created by jemo on  2018.11.17 10:59:03
 * Maintained by jemo from 2018.11.17 to now
 * Navigation Bar
 * 导航栏
 */

import React, { Component } from 'react'
import MediaQuery from 'react-responsive'
import { NavLink } from 'react-router-dom'

const linkStyle = {
  padding: 12,
  textDecoration: 'none',
  color: 'inherit',
  fontSize: 14,
}

const activeLinkStyle = {
  color: '#0000ff',
}

class NavigationBar extends Component {
  render() {
    return (
      <div
        style={{
          height: 40,
        }}>
        {/* mobile or pad 手机或平板 */}
        <MediaQuery query='(max-device-width: 1224px)'>
          <div style={{
            position: 'fixed',
            bottom: 0,
            width: '100%',
            display: 'flex',
            justifyContent: 'space-around',
            borderTopStyle: 'solid',
            borderTopColor: 'rgba(0, 0, 0, 0.2)',
            borderTopWidth: 1,
          }}>
            <NavLink
              style={linkStyle}
              activeStyle={activeLinkStyle}
              to='/my'>
              我的主页
            </NavLink>
            <NavLink
              style={linkStyle}
              activeStyle={activeLinkStyle}
              to='/classroom'>
              我的课堂
            </NavLink>
            <NavLink
              style={linkStyle}
              activeStyle={activeLinkStyle}
              to='/school'>
              我的学校
            </NavLink>
            <NavLink
              style={linkStyle}
              activeStyle={activeLinkStyle}
              to='/login'>
              登录
            </NavLink>
          </div>
        </MediaQuery>
        {/* pc or laptop 台式电脑或笔记本 */}
        <MediaQuery query='(min-device-width: 1224px)'>
          <div style={{
            position: 'fixed',
            top: 0,
            width: '100%',
            display: 'flex',
            justifyContent: 'space-around',
          }}>
            <NavLink
              style={linkStyle}
              activeStyle={activeLinkStyle}
              to='/my'>
              我的主页
            </NavLink>
            <NavLink
              style={linkStyle}
              activeStyle={activeLinkStyle}
              to='/classroom'>
              我的课堂
            </NavLink>
            <NavLink
              style={linkStyle}
              activeStyle={activeLinkStyle}
              to='/school'>
              我的学校
            </NavLink>
            <NavLink
              style={linkStyle}
              activeStyle={activeLinkStyle}
              to='/login'>
              登录
            </NavLink>
          </div>
        </MediaQuery>
      </div>
    )
  }
}

export default NavigationBar
