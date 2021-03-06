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
import Classroom from '../classroom'
import School from '../school'

class Home extends Component {
  render() {
    return(
      <div>
        {/* pc 导航栏 */}
        <MediaQuery query='(min-device-width: 1224px)'>
          <NavigationBar />
        </MediaQuery>
        <Route
          path='/my'
          component={My}
        />
        <Route
          path='/classroom'
          component={Classroom}
        />
        <Route
          path='/school'
          component={School}
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
