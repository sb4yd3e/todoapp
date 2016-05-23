import React from 'react'
import { Route, IndexRoute } from 'react-router'
import axios from 'axios'

import App from './components/App'
import Homepage from './components/Homepage'
import Signup from './components/Signup'
import Login from './components/Login'
import ProfileUser from './components/ProfileUser'
import BoardUser from './components/BoardUser'
import BoardPage from './components/BoardPage'
import Logged from '../helpers/checkLogin'
const socket = io.connect();
export default (
  <Route path="/" component={App}>
    <IndexRoute component={Homepage} />
    <Route path="signup" component={Signup} />
    <Route path="login" component={Login} />
    <Route path="profile" onEnter={Logged} component={ProfileUser} />
    <Route path="boards" onEnter={Logged} component={BoardUser} />
    <Route path="board/:bordId" onEnter={Logged} component={BoardPage} />
  </Route>
)
