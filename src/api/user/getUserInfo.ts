import jwt from 'jsonwebtoken'
import * as config from '../../config.json'
import User from '../../models/User.model'
import {FastifyReply, FastifyRequest} from "fastify";
const getUserInfo = async (req: FastifyRequest, res: FastifyReply<any>) => {
  console.log(req.body)
  const token: any = jwt.verify(req.headers.authorization, config.secret)
  let { user_id } = req.body
  console.log(token)
  if (!token) {
    res.status(401).send({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Invalid token'
    })
    return
  }
  if (!req.body.user_id) user_id = token.user_id
  const user = await User.findOne({
    where: {
      user_id
    }
  })
  if (!user) {
    res.status(404).send({ statusCode: 404, error: 'Not found', message: 'No user found' })
    return
  }
  if (user_id === token.user_id) {

  }
  res.status(200).send({
    statusCode: 200,
    response: {
      username: user.username,
      user_id,
      pub_key: user.pub_key,
      picture_url: user.picture_url
    }
  })
  return
}
export default getUserInfo
