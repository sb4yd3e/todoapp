import Joi from 'joi'
import shortid from 'shortid'
import isObject from 'lodash/isObject'
import pick from 'lodash/pick'
import jwt from 'jwt-simple'

import Neo4j from './db'
import defineError from '../helpers/defineError'
import config from '../config'

import Users from './Users'

/**
 * Errors
 */
const NotLogged = defineError('NotLogged')
const BadCreateRequest = defineError('BadCreateRequest')

/**
 * Methods
 */
const Sessions = {

  /**
   * Check Sessions
   */
  checkSession (cookie) {
    return new Promise(function (resolve, reject) {
      if (!cookie || !isObject(cookie)) throw new NotLogged()
      if (!cookie.sessionAUTH) throw new NotLogged()
      const token = cookie.sessionAUTH
      const userId = jwt.decode(token, config.secret)

      let tx = Neo4j.tx()

      tx.commit([
        Users.findByIdStmt(userId)
      ])
      .then(([results]) => {
        if (!results[0]) throw new NotLogged()
        resolve(Users.parseRow(results[0]))
      })
      .catch(reject)
    })
  }

}

export default Sessions
