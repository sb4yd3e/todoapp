import jwt from 'jwt-simple'

import config from '../../config'
import { SESSION, SESSION_DELETE } from '../actions'

const INITIAL_STATE = { user: false, error: false }

export default function (state = INITIAL_STATE, action) {

  switch (action.type) {
    case SESSION:
      if (!action.payload.data.error) {
        const decodedData = jwt.decode(action.payload.data, config.secret)
        return { ...state, user: decodedData }
      }
      return { ...state, user: false, error: action.payload.data.error }
    case SESSION_DELETE:
      return { ...state, user: false, error: false }
    default:
      return state
  }

}
