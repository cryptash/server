import User from '../../models/User.model'
import bcrypt from 'bcrypt'
import nanoid from 'nanoid'
import fastify from 'fastify'
import Chat from '../../models/Chat.model'
import jwt from 'jsonwebtoken'
import * as config from '../../config.json'
import { literal, Op } from 'sequelize'

const createChat = async (
  req: fastify.FastifyRequest,
  res: fastify.FastifyReply<object>
) => {
  console.log(req.body)
  const token: any = jwt.verify(req.headers.authorization, config.secret)
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
  // if (await Chat.findOne({
  //     where: {
  //         users: [Op.contains]: [req.body.user_id,token.user_id],
  //     }
  // })) {
  //     res.status(409).send({
  //         statusCode: 409,
  //         error: 'Conflict',
  //         message: 'Chat already exists'
  //     })
  // }
  const user1 = await User.findOne({
    where: {
      user_id: token.user_id
    }
  })
  const user2 = await User.findOne({
    where: {
      user_id: req.body.user_id
    }
  })
  console.log([user1, user2])
  const chat = new Chat({
    users: [req.body.user_id, token.user_id],
    chat_id: nanoid.nanoid(21)
  })
  try {
    await chat.save()
    // @ts-ignore
    user1.addChat(chat)
    // @ts-ignore
    user2.addChat(chat)
  } catch (e) {
    if (e) return console.log(e)
  }

  res.status(200).send({ statusCode: 200 })
}
export default createChat
