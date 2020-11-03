import jwt from 'jsonwebtoken'
import * as config from '../../config.json'
import User from '../../models/User.model'
const getUserInfo = async (req: any, res: any) => {
  console.log(req.body)
  const token: any = jwt.verify(req.headers.authorization, config.secret)
  let { user_id } = req.body
  console.log(token)
  if (!token)
    return {
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Invalid token'
    }
  if (!req.body.user_id) user_id = token.user_id
  const user = await User.findOne({
    where: {
      user_id
    }
  })
  if (!user)
    return { statusCode: 404, error: 'Not found', message: 'No user found' }
  return {
    statusCode: 200,
    response: {
      username: user.username,
      user_id,
      pub_key: user.pub_key,
      picture_url: user.picture_url
    }
  }
}
export default getUserInfo
