import { Connection } from 'mongoose'
import jwt from 'jsonwebtoken'
import * as config from '../config.json'
import User from '../models/User.model'
const getKey = async (req: any, res: any) => {
  console.log(req.body)
  const token = jwt.verify(req.headers.authorization, config.secret)
  if (!token) return { 403: { text: 'Invalid JWT' } }
  if (!req.body.user_id) return { 400: { text: "user_id can't be empty" } }
  const user = await User.findOne({
    where: {
      user_id: req.body.user_id
    }
  })
  console.log(user)
  if (!user) return { 404: 'User not found' }
  return { 200: { key: user.pub_key } }
}
export default getKey
