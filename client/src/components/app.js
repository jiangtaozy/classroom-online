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
import { getLastObject } from '../indexedDB'
import environment from '../environment'
import { graphql, QueryRenderer } from 'react-relay'

class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
      token: '',
    }
  }

  async componentDidMount() {
    const lastUser = await getLastObject('user')
    const {
      token,
    } = lastUser || {}
    this.setState({
      token,
    })
  }

  render() {
    const {
      token,
    } = this.state
    return (
      <QueryRenderer
        environment={environment}
        query={graphql`
          query appQuery($token: String) {
            user(token: $token) {
              ...my_user,
            },
            viewer {
              ...school_viewer,
            }
          }
        `}
        variables={{token}}
        render={({error, props}) => {
          if(error) {
            return <div>error!</div>
          }
          if(!props) {
            return <div>Loading...</div>
          }
          return (
            <Router>
              <Switch>
                <Route
                  path='/my'
                  render={() => {
                    return (
                      <Home
                        user={props.user}
                        token={token}
                      />
                    )}
                  }
                />
                <Route
                  path='/classroom'
                  component={Home}
                />
                <Route
                  path='/school'
                  render={() => {
                    return (
                      <Home
                        viewer={props.viewer}
                      />
                    )
                  }}
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
                  to='/school'
                />
              </Switch>
            </Router>
          )
        }}
      />
    )
  }
}

export default App
