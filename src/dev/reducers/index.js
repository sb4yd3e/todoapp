import { combineReducers } from 'redux'

import SessionsReducer from './reducer_sessions'

const rootReducer = combineReducers({
  session: SessionsReducer
})

export default rootReducer
