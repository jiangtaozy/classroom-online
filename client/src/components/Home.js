/*
 * Created by jemo on 2018-6-18.
 * Home
 */

import React, { Component } from 'react'
import { Link } from 'found'

class Home extends Component {
  render() {
    return(
      <div>
        <Link
          to='/about'>
          about
        </Link>
        <Link
          to='/register'>
          注册
        </Link>
      </div>
    )
  }
}

export default Home
