import User from '../models/User.model'
import {FastifyInstance, FastifyReply, FastifyRequest} from 'fastify'
import * as http from "http";
const Login = async (req:  FastifyRequest<{
  Body: {
    username: string,
    password: string,
  },
}>, res: FastifyReply<http.Server>) => {
  const user = await User.findOne({ where: { username: req.body.username } })
  console.log(user)
  if (!user) {
    res
      .status(400)
      .send({ statusCode: 400, error: 'Bad request', message: 'No user found' })
    return
  }
  if (!user.validatePassword(req.body.password)) {
    res.status(401).send({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Wrong password'
    })
    return
  } else {
    res.status(200).send({
      statusCode: 200,
      ...user.toAuthJSON()
    })
  }
  return
}
export default Login
