/*
 * Maintainer by jemo from 2018.12.5 to now
 * Created by jemo on 2018.12.5 22:45:38
 * app
 */

import React, { Component } from 'react'
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from 'react-router-dom'
import Home from './home'
import About from './about'
import Register from './register'
import Login from './login'

class App extends Component {

  render() {
    return (
      <Router>
        <Switch>
          <Route
            path='/my'
            component={Home}
          />
          <Route
            path='/classroom'
            component={Home}
          />
          <Route
            path='/school'
            component={Home}
          />
          <Route
            path='/about'
            component={About}
          />
          <Route
            path='/register'
            component={Register}
          />
          <Route
            path='/login'
            component={Login}
          />
          <Redirect
            from='/'
            to='/my'
          />
        </Switch>
      </Router>
    )
  }
}

export default App
