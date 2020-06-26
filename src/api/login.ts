import User from '../models/User.model'
import jwt from 'jsonwebtoken'
import * as config from '../config.json'
import { Connection } from 'mongoose'
import { FastifyReply } from 'fastify'
const Login = async (req: any, res: any, db: Connection) => {
  console.log(req.body)
  const user = await User.findOne({ username: req.body.username })
  if (!user) {
    return { 403: { text: 'no user' } }
  }
  console.log(await user.validatePassword(req.body.password))
  console.log(await user.toAuthJSON())
  if (!(await user.validatePassword(req.body.password)))
    return { 403: { text: 'wrong password' } }
  else return { 200: { jwt: await user.toAuthJSON() } }
}
export default Login
