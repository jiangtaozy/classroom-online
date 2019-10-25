/*
 * Created by jemo on  2018.11.17 10:59:03
 * Maintained by jemo from 2018.11.17 to now
 * Navigation Bar
 * 导航栏
 */

import React, { Component } from 'react'
import MediaQuery from 'react-responsive'
import { NavLink } from 'react-router-dom'

const navDataArray = [
  {
    title: '主页',
    link: '/school',
  },
  /*
  {
    title: '课堂',
    link: '/classroom/0',
  },
  */
  {
    title: '我的',
    link: '/my',
  },
]

class NavigationBar extends Component {
  render() {
    const navLinkList = navDataArray.map((navItem, index) => {
      return (
        <NavLink
          style={{
            padding: 12,
              textDecoration: 'none',
              color: 'inherit',
              fontSize: 14,
          }}
          activeStyle={{
            color: '#0000ff',
          }}
          to={navItem.link}
          key={index}>
          {navItem.title}
        </NavLink>
      )
    })
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
            {navLinkList}
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
            {navLinkList}
          </div>
        </MediaQuery>
      </div>
    )
  }
}

export default NavigationBar
