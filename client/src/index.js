/*
 * Created by jemo on 2017-12-31.
 * index
 */

import React from 'react'
import ReactDOM from 'react-dom'
import registerServiceWorker from './registerServiceWorker'
import { css } from 'glamor'
import Router from './Router'
import { Resolver } from 'found-relay'
import environment from './environment'

css.global('html, body', { margin: 0, padding: 0 })

ReactDOM.render(
  <Router resolver={new Resolver(environment)} />,
  document.getElementById('root')
)

registerServiceWorker()
