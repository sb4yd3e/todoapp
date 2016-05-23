import express from 'express'

import sessions from './sessions'
import users from './users'

let websiteAPI = express.Router()

sessions(websiteAPI)
users(websiteAPI)

export default websiteAPI
