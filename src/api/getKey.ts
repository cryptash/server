import jwt from 'jsonwebtoken'
import * as config from '../config.json'
import User from '../models/User.model'
import {FastifyReply, FastifyRequest} from 'fastify'
import * as http from "http";
const getKey = async (req:  FastifyRequest<{
  Body: {
    user_id: string
  },
}>, res: FastifyReply<http.Server>) => {
  console.log(req.body)
  const token = jwt.verify(req.headers.authorization || '', config.secret)
  if (!token) {
    res.status(401).send({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Invalid token'
    })
    return
  }
  if (!req.body.user_id) {
    res.status(400).send({
      statusCode: 400,
      error: 'Bad request',
      message: "user_id can't be empty"
    })
    return
  }
  const user = await User.findOne({
    where: {
      user_id: req.body.user_id
    }
  })
  console.log(user)
  if (!user) {
    res
      .status(404)
      .send({ statusCode: 404, error: 'Not found', message: 'No user found' })
    return
  }
  res.status(200).send({ statusCode: 200, key: user.pub_key })
}
export default getKey
