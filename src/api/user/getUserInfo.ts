import jwt from 'jsonwebtoken'
import * as config from '../../config.json'
import User from '../../models/User.model'
import {FastifyReply, FastifyRequest} from "fastify";
import Chat from "../../models/Chat.model";
import SendMessage from "../messages/send";
import Message from "../../models/Message.model";
import {Op} from "sequelize";

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
  if (!req.body.user_id) {
    const user = await User.findOne({
      where: {
        user_id: token.user_id
      },
      include: [{
        model: Chat,
        attributes: {
          exclude: []
        },
        include: [{
          model: Message,
          limit: 1,
          as: 'Messages'
        }, {
          model: User,
          attributes: ['pub_key', 'user_id', 'picture_url', 'username'],
          where: {
            [Op.not]: [
              {'user_id': token.user_id}
            ]
          }
        }]
      }],
    })
    if (!user) return
    res.status(200).send({
      statusCode: 200,
      response: {
        username: user.username,
        user_id: token.user_id,
        pub_key: user.pub_key,
        picture_url: user.picture_url,
        chats: user.Chats,
      }
    })
    return
  }

  return
}
export default getUserInfo
