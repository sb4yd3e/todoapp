import { createStore, applyMiddleware } from 'redux'
import promise from 'redux-promise'
import jwt from 'jwt-simple'

import config from '../config'
import defineError from './defineError'
import reducers from '../dev/reducers'
import { checkSessions } from '../dev/actions'

const NotLogged = defineError('NotLogged')

const createStoreWithMiddleware = applyMiddleware(promise)(createStore)
const store = createStoreWithMiddleware(reducers)

export default (nextState, replace, callback) => {

  store.dispatch(checkSessions())
  .then((response) => {
    if (response.payload.data.error) throw new NotLogged
    const decodeSession = jwt.decode(response.payload.data, config.secret)

    if (!decodeSession.id) throw new NotLogged
    callback()
  })
  .catch((error) => {
    replace('/login')
    callback()
  })
}
