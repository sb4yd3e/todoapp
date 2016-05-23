import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'
import { Router, browserHistory } from 'react-router'
import promise from 'redux-promise'
import jwt from 'jwt-simple'

import config from '../config'
import routes from './routes'
import reducers from './reducers'

import { checkSessions } from './actions'

let token = window.INITIAL_STATE
let initialState = jwt.decode(token, config.secret)

const createStoreWithMiddleware = applyMiddleware(promise)(createStore)
const store = createStoreWithMiddleware(reducers, initialState)

ReactDOM.render(
  <Provider store={store}>
    <Router history={browserHistory} routes={routes}/>
  </Provider>,
  document.querySelector('#myApp')
)
