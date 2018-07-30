/*
 * Created by jemo on 2018-6-18.
 * Home
 */

import React, { Component } from 'react'
import { NavLink } from 'react-router-dom'

class Home extends Component {
  render() {
    return(
      <div>
        <NavLink
          to='/about'>
          about
        </NavLink>
        <NavLink
          to='/register'>
          注册
        </NavLink>
      </div>
    )
  }
}

export default Home