/*
 * Created  by jemo on 2018-1-15.
 * create redux store
 */

import { createBrowserHistory } from 'history'
import { applyMiddleware, compose, createStore, } from 'redux'
import { connectRouter, routerMiddleware } from 'connected-react-router'
import thunkMiddleware from 'redux-thunk'
//import { createLogger } from 'redux-logger'
import reducer from './reducer'

//const loggerMiddleware = createLogger()

export const history = createBrowserHistory()
export const store = createStore(
  connectRouter(history)(reducer),
  compose(
    applyMiddleware(
      routerMiddleware(history),
      thunkMiddleware,
      //loggerMiddleware
    ),
  ),
)
