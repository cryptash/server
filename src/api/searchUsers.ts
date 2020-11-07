import User from '../models/User.model'
import sequelize from 'sequelize'
import jwt from 'jsonwebtoken'
import * as config from '../config.json'
import { FastifyReply, FastifyRequest } from 'fastify'

const searchUsers = async (req: FastifyRequest, res: FastifyReply<object>) => {
  console.log(req)
  const query = req.body.query.toLowerCase()
  if (query.length < 4)
    return {
      statusCode: 400,
      message: 'Query must be longer than 3',
      error: 'Bad request'
    }
  const token = jwt.verify(req.headers.authorization, config.secret)
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
  const users = await User.findAll({
    where: {
      username: sequelize.where(
        sequelize.fn('LOWER', sequelize.col('username')),
        'LIKE',
        '%' + query + '%'
      )
    }
  })
  const result: {
    username: string
    user_id: string
    picture_url: string
  }[] = []
  users.map((user) => {
    result.push({
      username: user.username,
      user_id: user.user_id,
      picture_url: user.picture_url
    })
  })
  res
    .status(200)
    .send({ statusCode: 200, data: { users: result, count: result.length } })
  return
}
export default searchUsers
