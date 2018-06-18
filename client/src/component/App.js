/*
 * Created by jemo on 2018-1-15.
 * app
 */

import React, { Component } from 'react'
import { ConnectedRouter } from 'react-router-redux'
import { Route } from 'react-router-dom'
import { history } from '../configureStore'
import Home from './Home'
import About from './About'
//import Chatroom from './Chatroom'

class App extends Component {
  render() {
    return (
      <ConnectedRouter history={history}>
        <div>
          <Route exact path='/' component={Home} />
          <Route path='/about' component={About} />
        </div>
      </ConnectedRouter>
    )
  }
}

export default App
