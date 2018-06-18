/*
 * Created by jemo on 2018-1-15.
 * reduces
 */

import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'

const rootReducer = combineReducers({
  router: routerReducer,
})

export default rootReducer
