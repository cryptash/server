import jwt from 'jsonwebtoken'
import * as config from '../../config.json'
import User from '../../models/User.model'
import { FastifyReply, FastifyRequest } from 'fastify'
import Chat from '../../models/Chat.model'
import Message from '../../models/Message.model'
import {literal, Op} from 'sequelize'

interface ChatResponse {
  chat_id: string,
  messageAt: Date,
  user: {
    user_id: string
    pub_key: string
    picture: string
    username: string
  },
  messages: Array<{
    content: string,
    fromMe: boolean,
    date: Date,
    read: boolean,
    message_id: string
  }>
}

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
    const response: {
      username: string,
      user_id: string,
      pub_key: string,
      picture: string,
      chats: Array<ChatResponse>
    } = {
      username: user.username,
      user_id: token.user_id,
      pub_key: user.pub_key,
      picture: user.picture_url,
      chats: []
    }
    //@ts-ignore
    user.Chats.sort((a, b) => new Date(b.messageAt) - new Date(a.messageAt))
    user.Chats.forEach(chat => {
      //@ts-ignore
      const user = chat['Users'][0]
      const result: ChatResponse = {
        chat_id: chat.chat_id,
        messageAt: chat.messageAt,
        user: {
          user_id: user.user_id,
          pub_key: user.pub_key,
          picture: user.picture_url,
          username: user.username,
        },
        messages: []
      }
      // @ts-ignore
      chat['Messages'].forEach(msg => {
        result.messages.push({
          content: msg.content,
          fromMe: msg.from === token.user_id,
          date: msg.createdAt,
          read: msg.read,
          message_id: msg.message_id,
        })
      });
      response.chats.push(result)
    })
    res.status(200).send({
      statusCode: 200,
      response
    })
    return
  }

  return
}
export default getUserInfo
