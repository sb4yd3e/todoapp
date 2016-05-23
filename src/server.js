import express from 'express'
import path from 'path'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import exphbs from 'express-handlebars'
import jwt from 'jwt-simple'

import config from './config'
import API from './api'
import Sessions from './domain/Sessions'


import http from 'http';

let app = express()

app.set('port', 5000);
if (process.env.NODE_ENV === 'development') {
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
}

const root = `${__dirname}/public`

/**
 * Setup Handlebars engine
 */
app.set('views', __dirname + '/public')
app.engine('.hbs', exphbs({
  extname: '.hbs',
  helpers: {
    json: function (context) {
      return JSON.stringify(context)
    },
    datetime: function (epoch) {
      var date = new Date(epoch)
      try {
        var str = date.toISOString()
        return str
      } catch (e) {
        return ''
      }
    }
  }
}))
app.set('view engine', '.hbs')

/**
 * Body parsing
 */
app.use(bodyParser.json())
app.use((err, req, res, next) => {
  if (err) {
    return res.status(400).send({
      error: 'bad_json_format',
      message: 'Bad formatted JSON in request payload'
    })
  }
  next()
})
app.use(bodyParser.urlencoded({ extended: false }))

/**
 * Cookie Parser
 */
app.use(cookieParser())

/**
 * Api Routes
 */
app.use('/api/v1', API)

/**
 * Static Page: for single page application
 */
app.use(express.static(root))

/**
 * Check login first time enter in Application
 * and pass initial state to Client (Redux)
 */
app.get('*', function (req, res) {

  const cookie = req.cookies

  Sessions.checkSession(cookie)
  .then((data) => {
    let initialState = {session: { user: data, error: false } }
    let token = jwt.encode(initialState, config.secret)
    res.render('index', {initialState: JSON.stringify(token)})
  })
  .catch((error) => {
    let initialState = { session: { user: false, error: false } }
    let token = jwt.encode(initialState, config.secret)
    res.render('index', {initialState: JSON.stringify(token)})
  })

})

export default app
