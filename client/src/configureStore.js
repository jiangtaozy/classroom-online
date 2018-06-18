/*
 * Created  by jemo on 2018-1-15.
 * create redux store
 */

import { createStore, applyMiddleware } from 'redux'
import createHistory from 'history/createBrowserHistory'
import { routerMiddleware } from 'react-router-redux'
import thunkMiddleware from 'redux-thunk'
import { createLogger } from 'redux-logger'
import reducer from './reducer'

export const history = createHistory()
const historyRouterMiddleware = routerMiddleware(history)
const loggerMiddleware = createLogger()

export const store = createStore(
  reducer,
  applyMiddleware(
    historyRouterMiddleware,
    thunkMiddleware,
    loggerMiddleware
  )
)
