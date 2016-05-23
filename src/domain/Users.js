import Joi from 'joi'
import shortid from 'shortid'
import { isObject, pick, remove } from 'lodash'
import bcrypt from 'bcrypt'

import Neo4j from './db'
import defineError from '../helpers/defineError'

const LABEL = 'User'

/**
 * Errors
 */
const UserAlreadyExist = defineError('UserAlreadyExist')
const UserNotFound = defineError('UserNotFound')
const LoginError = defineError('LoginError')
const NotLogged = defineError('NotLogged')
const BadCreateRequest = defineError('BadCreateRequest')

/**
 * User node's Schema
 */
const generateFullName = (context) => {
 return context.firstName + ' ' + context.lastName;
}
generateFullName.description = 'generated fullName';

const Schema = {
  create: {
    id: Joi.string().required(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    fullName: Joi.string().default(generateFullName),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    auth: Joi.string().default('USER')
  }
}

/**
 * Methods
 */
const Users = {

  parseRow (row) {
    let user = row.user
    if(user.password) delete user.password
    return user
  },

  /**
   * Statement to find a User by id
   */
  findByIdStmt (id) {
    return Neo4j.tx().stmt(
      `MATCH (user:${LABEL})
      WHERE user.id = {id}
      RETURN user`,
      {id}
    )
  },

  /**
   * Statement to find a User by email
   */
  findByMailStmt (email) {
    return Neo4j.tx().stmt(
      `MATCH (user:${LABEL})
      WHERE user.email = {email}
      RETURN user`,
      {email}
    )
  },

  /**
   * Create new user
   */
  create (user) {
    return new Promise(function (resolve, reject) {
      if (!user || !isObject(user)) throw new BadCreateRequest('เกิดข้อผิดพลาดบางอย่าง!')
      // Add unic ID to User Object
      user = Object.assign({}, user, {id: shortid()})
      // Validate user object
      let validation = Joi.validate(user, Schema.create)
      if (validation.error) throw new BadCreateRequest('เกิดข้อผิดพลาดบางอย่าง!')

      let userData = pick(validation.value, [
        'id',
        'firstName',
        'lastName',
        'fullName',
        'email',
        'password',
        'auth'
      ])

      // Crypt password
      const salt = bcrypt.genSaltSync(10)
      const hash = bcrypt.hashSync(userData.password, salt)
      userData.password = hash;
      // Assign datetime
      userData.createdAt = new Date().getTime()

      let tx = Neo4j.tx()

      tx.commit([
        Users.findByMailStmt(userData.email)
      ])
      .then(([results]) => {
        if (results[0]) throw new UserAlreadyExist('อีเมล์นี้ถูกใช้งานแล้ว.')

        let tx = Neo4j.tx()

        tx.commit([
          tx.stmt(
            `CREATE (user:${LABEL})
            SET user = {userData}
            RETURN user`,
            {userData}
          ),
          Users.findByIdStmt(userData.id)
        ])
        .then(([_, results]) => {
          resolve(Users.parseRow(results[0]))
        })

      })
      .catch(reject)
    })
  },

  /**
   * Login User
   */
  login (user) {
    return new Promise(function (resolve, reject) {

      let tx = Neo4j.tx()

      tx.commit([
        Users.findByMailStmt(user.email)
      ])
      .then(([results]) => {
        if (!results[0]) throw new UserNotFound('เกิดข้อผิดพลาดบางอย่าง!')
        const checkPassword = bcrypt.compareSync(user.password, results[0].user.password);
        if (!checkPassword) throw new LoginError('เข้าสู่ระบบผิดพลาด!')
        resolve(Users.parseRow(results[0]))
      })
      .catch(reject)
    })
  },

  /**
   * Find User by ID
   */
  findUserById (userId) {
    return new Promise(function (resolve, reject) {

      let tx = Neo4j.tx()

      tx.commit([
        Users.findByIdStmt(userId)
      ])
      .then(([results]) => {
        if (!results[0]) throw new UserNotFound('เกิดข้อผิดพลาดบางอย่าง!')
        resolve(Users.parseRow(results[0]))
      })
      .catch(reject)
    })
  },

}

export default Users
