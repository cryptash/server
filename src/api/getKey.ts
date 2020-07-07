import jwt from 'jsonwebtoken'
import * as config from '../config.json'
import User from '../models/User.model'
const getKey = async (req: any, res: any) => {
  console.log(req.body)
  const token = jwt.verify(req.headers.authorization, config.secret)
  if (!token)
    return {
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Invalid token'
    }
  if (!req.body.user_id)
    return {
      statusCode: 400,
      error: 'Bad request',
      message: "user_id can't be empty"
    }
  const user = await User.findOne({
    where: {
      user_id: req.body.user_id
    }
  })
  console.log(user)
  if (!user)
    return { statusCode: 404, error: 'Not found', message: 'No user found' }
  return { 200: { key: user.pub_key } }
}
export default getKey
