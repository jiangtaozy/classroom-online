/*
 * Created by jemo on 2018-6-18.
 * About
 */

import React, { Component } from 'react'
import { NavLink } from 'react-router-dom'

class About extends Component {
  render() {
    return(
      <div>
        about
        <NavLink
          to='/'>
          home
        </NavLink>
      </div>
    )
  }
}

export default About
