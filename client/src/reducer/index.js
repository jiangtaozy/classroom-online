/*
 * Created by jemo on 2018-1-15.
 * reduces
 */

import { combineReducers } from 'redux'

// test
const awesome = (state = 0, action) => {
  return state
}

const rootReducer = combineReducers({
  awesome,
})

export default rootReducer
