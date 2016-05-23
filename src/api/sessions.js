import Users from '../domain/Users'
import Sessions from '../domain/Sessions'
import express from 'express'
import cookieParser from 'cookie-parser'
import jwt from 'jwt-simple'

import config from '../config'

let app = express()

export default function (router) {

  /*
  * GET
  * Check Sessions:
  * Send cookie object, if contains user id, set session and re-set cookie
  */
  router.get('/sessions', function (req, res) {
    const cookie = req.cookies
    Sessions.checkSession(cookie)
    .then((data) => {

      const token = jwt.encode(data.id, config.secret)
      const dataTokened = jwt.encode(data, config.secret)

      res.setHeader('Content-Type', 'application/json')
      res.cookie('sessionAUTH', token, { path: '/', expires: new Date(Date.now() + 345600000)})
      res.send(JSON.stringify(dataTokened))

    })
    .catch((error) => {
      res.send({error})
    })
  })

  /*
  * GET
  * Delete Sessions:
  * Destroy cookie
  */
  router.delete('/sessions', function (req, res) {
    res.clearCookie('sessionAUTH')
    res.send()
  })

}
