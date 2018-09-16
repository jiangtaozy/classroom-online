/*
 * Created by jemo on 2018-9-16
 * found-relay router
 */

import React from 'react'
import { BrowserProtocol, queryMiddleware } from 'farce'
import {
  createFarceRouter,
  createRender,
  makeRouteConfig,
  Route,
} from 'found'
import Home from './components/Home'
import About from './components/About'
import Register from './components/Register'

const Router = createFarceRouter({
  historyProtocol: new BrowserProtocol(),
  historyMiddlewares: [queryMiddleware],
  routeConfig: makeRouteConfig(
    <Route
      path='/'>
      <Route
        Component={Home}
      />
      <Route
        path='about'
        Component={About}
      />
      <Route
        path='register'
        Component={Register}
      />
    </Route>
  ),
  render: createRender({}),
})

export default Router
