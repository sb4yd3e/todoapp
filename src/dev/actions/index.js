import axios from 'axios'

import config from '../../config'

// Session
export const SESSION = 'SESSION'
export const SESSION_DELETE = 'SESSION_DELETE'

const ROOT_URL = `${config.rootURL}:${config.port}/api/v1`

/*
* POST
* Create new user
*/
export function createUsers (user) {
  const request = axios.post(`${ROOT_URL}/users/signup`, user)

  return {
    type: SESSION,
    payload: request
  }

}

/*
* POST
* Login user
*/
export function loginUsers (user) {
  const request = axios.post(`${ROOT_URL}/users/login`, user)

  return {
    type: SESSION,
    payload: request
  }

}

/*
* POST
* Upload avatar
*/
export function avatarUsers (user) {
  const request = axios.post(`${ROOT_URL}/user/avatar`, user)
  return {
    type: SESSION,
    payload: request
  }

}

/*
* GET
* Check Sessions
*/
export function checkSessions () {
  const request = axios.get(`${ROOT_URL}/sessions`)

  return {
    type: SESSION,
    payload: request
  }

}

/*
* DELETE
* Delete Sessions
*/
export function deleteSessions () {
  const request = axios.delete(`${ROOT_URL}/sessions`)

  return {
    type: SESSION_DELETE,
    payload: request
  }

}
