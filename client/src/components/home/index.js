/*
 * Maintained by jemo from 2018.6.18 to now
 * Created by jemo on 2018.6.18
 * Home
 */

import React, { Component } from 'react'
import NavigationBar from '../navigation-bar/'
import MediaQuery from 'react-responsive'
import { Route } from 'react-router-dom'
import My from '../my'
import School from '../school'
import Chatroom from '../chatroom'

class Home extends Component {
  render() {
    const {
      user,
      token,
      viewer,
    } = this.props
    return(
      <div>
        {/* pc 导航栏 */}
        <MediaQuery query='(min-device-width: 1224px)'>
          <NavigationBar />
        </MediaQuery>
        <Route
          path='/my'
          render={() => {
            return (
              <My
                user={user}
                token={token}
              />
            )
          }}
        />
        <Route
          path='/classroom'
          component={Chatroom}
        />
        <Route
          path='/school'
          render={() => {
            return (
              <School
                viewer={viewer}
              />
            )
          }}
        />
        {/* mobile 导航栏 */}
        <MediaQuery query='(max-device-width: 1224px)'>
          <NavigationBar />
        </MediaQuery>
      </div>
    )
  }
}

export default Home
