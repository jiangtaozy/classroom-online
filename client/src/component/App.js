/*
 * Created by jemo on 2018-1-15.
 * app
 */

import React, { Component } from 'react'
import { ConnectedRouter } from 'connected-react-router'
import { Route } from 'react-router'
import { history } from '../configureStore'
import Home from './Home'
import About from './About'
import Register from './Register'
//import Chatroom from './Chatroom'

class App extends Component {
  render() {
    return (
      <ConnectedRouter history={history}>
        <div>
          <Route exact path='/' component={Home} />
          <Route path='/about' component={About} />
          <Route path='/register' component={Register} />
        </div>
      </ConnectedRouter>
    )
  }
}

export default App
