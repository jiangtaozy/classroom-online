/*
 * Maintained by jemo from 2017.12.31 to now
 * Created by jemo on 2017.12.31.
 * index
 */

import React from 'react'
import ReactDOM from 'react-dom'
import registerServiceWorker from './registerServiceWorker'
import { css } from 'glamor'
import App from './components/app'
//import Router from './router'
//import { Resolver } from 'found-relay'
//import environment from './environment'
//import vconsole from 'vconsole'

//new vconsole()

css.global('html, body', { margin: 0, padding: 0 })

ReactDOM.render(
  <App />,
  document.getElementById('root')
)

registerServiceWorker()
