import cookieParser from 'cookie-parser'
import jwt from 'jwt-simple'

import config from '../config'
import Users from '../domain/Users'
import Sessions from '../domain/Sessions'

export default function (router) {

  /*
  * POST
  * Create user
  */
  router.post('/users/signup', function (req, res) {
    Users.create(req.body)
    .then((data) => {

      res.setHeader('Content-Type', 'application/json')
      const token = jwt.encode(data.id, config.secret)
      res.cookie('sessionAUTH', token, { path: '/', expires: new Date(Date.now() + 345600000)})

      const cookie = {
        sessionAUTH: token
      }

      Sessions.checkSession(cookie)
      .then((data) => {
        const token = jwt.encode(data, config.secret)
        res.send(JSON.stringify(token))
      })
      .catch((error) => {
        res.send({error})
      })

    })
    .catch((error) => {
      res.send({error})
    })
  })

  /*
  * POST
  * User login
  */
  router.post('/users/login', function (req, res) {
    Users.login(req.body)
    .then((data) => {

      res.setHeader('Content-Type', 'application/json')
      const token = jwt.encode(data.id, config.secret)
      res.cookie('sessionAUTH', token, { path: '/', expires: new Date(Date.now() + 345600000)})

      const cookie = {
        sessionAUTH: token
      }

      Sessions.checkSession(cookie)
      .then((data) => {
        const token = jwt.encode(data, config.secret)
        res.send(JSON.stringify(token))
      })
      .catch((error) => {
        res.send({error})
      })

    })
    .catch((error) => {
      res.send({error})
    })
  })

  /*
  * POST
  * User upload avatar
  */
  router.post('/users/avatar', function (req, res) {
    Users.login(req.body)
    .then((data) => {

      console.log(data);

    })
    .catch((error) => {
      res.send({error})
    })
  })

  /*
  * GET
  * Find User by ID
  */
  router.get('/users', function (req, res) {

    const cookie = req.cookies
    const userId = req.query.id

    // Check if actual user have a session
    Sessions.checkSession(cookie)
    .then((sessionData) => {

      // if he have a session, find him by userId
      Users.findUserById(userId)
      .then((userData) => {

        // if userId !== sessionId send status 401
        if (userData.id !== sessionData.id)
          res.status(401).send({
            error: {
              status: 401,
              reason: 'Unauthorized'
            }
          })

        res.send(JSON.stringify(userData))

      })
      .catch((error) => {
        res.status(404).send({
          error: {
            status: 404,
            reason: 'NotFound'
          }
        })
      })

    })
    .catch((error) => {
      res.send({error})
    })

  })

}
