import jwt from 'jsonwebtoken'
import * as config from '../../config.json'
import User from '../../models/User.model'
import { FastifyReply, FastifyRequest } from 'fastify'
import Chat from '../../models/Chat.model'
import Message from '../../models/Message.model'
import {literal, Op} from 'sequelize'

const getUserInfo = async (req:  FastifyRequest<{
  Body: {
    user_id: string
  },
}>, res: FastifyReply<any>) => {
  const token: any = jwt.verify(req.headers.authorization || '', config.secret)
  if (!token) {
    res.status(401).send({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Invalid token'
    })
    return
  }
  if (!req.body.user_id) {
    const user = await User.findOne({
      where: {
        user_id: token.user_id
      },
      include: [
        {
          model: Chat,
          required: false,
          order: [[literal('`updatedAt`'), 'DESC']],
          attributes: {
            exclude: []
          },
          include: [
            {
              model: Message,
              required: false,
              limit: 1,
              order: [['createdAt', 'DESC']],
              as: 'Messages'
            },
            {
              model: User,
              required: false,
              attributes: ['pub_key', 'user_id', 'picture_url', 'username'],
              where: {
                [Op.not]: [{ user_id: token.user_id }]
              }
            }
          ],
        }
      ]
    })
    if (!user) {
      res.status(401).send({
        statusCode: 404,
        error: 'Unauthorized',
        message: 'Invalid token'
      })
      return
    }
    res.status(200).send({
      statusCode: 200,
      response: {
        username: user.username,
        user_id: token.user_id,
        pub_key: user.pub_key,
        picture_url: user.picture_url,
        chats: user.Chats
      }
    })
    return
  }

  return
}
export default getUserInfo
