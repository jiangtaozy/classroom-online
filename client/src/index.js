/*
 * Created by jemo on 2017-12-31.
 * index
 */

import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { store } from './configureStore'
import App from './component/App'
import registerServiceWorker from './registerServiceWorker'
import { css } from 'glamor'

css.global('html, body', { margin: 0, padding: 0 })

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)

registerServiceWorker()
