import seq from 'sequelize'
import { BaseServer, ServerMeta } from '@logux/server'
import { ChannelContext } from '@logux/server/context'
import User from '../../models/User.model.js'
import Chat from '../../models/Chat.model.js'
import Message from '../../models/Message.model.js'

interface ChatResponse {
  chat_id: string
  messageAt: Date
  user: {
    user_id: string
    pub_key: string
    picture: string
    username: string
  }
  messages: Array<{
    content: string
    fromMe: boolean
    date: Date
    read: boolean
    message_id: string
  }>
}

const getUserInfo = async (
  ctx: ChannelContext<any, any, any>,
  action: any,
  meta: ServerMeta,
  server: BaseServer
) => {
  const params = ctx.params
  if (params.id) {
    const user = await User.findOne({
      where: {
        user_id: params.id
      },
      include: [
        {
          model: Chat,
          required: false,
          order: [[seq.literal('`updatedAt`'), 'DESC']],
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
                [seq.Op.not]: [{ user_id: params.id }]
              }
            }
          ]
        }
      ]
    })
    if (!user) {
      return server.undo(action, meta, 'Unknown user')
    }
    const response: {
      username: string
      user_id: string
      pub_key: string
      picture: string
      chats: Array<ChatResponse>
    } = {
      username: user.username,
      user_id: params.id,
      pub_key: user.pub_key,
      picture: user.picture_url,
      chats: []
    }
    //@ts-ignore
    user.Chats.sort((a, b) => new Date(b.messageAt) - new Date(a.messageAt))
    user.Chats.forEach((chat) => {
      //@ts-ignore
      const user = chat['Users'][0]
      const result: ChatResponse = {
        chat_id: chat.chat_id,
        messageAt: chat.messageAt,
        user: {
          user_id: user.user_id,
          pub_key: user.pub_key,
          picture: user.picture_url,
          username: user.username
        },
        messages: []
      }
      // @ts-ignore
      chat['Messages'].forEach((msg) => {
        result.messages.push({
          content: msg.content,
          fromMe: msg.from === params.id,
          date: msg.createdAt,
          read: msg.read,
          message_id: msg.message_id
        })
      })
      response.chats.push(result)
    })
    return ctx.sendBack({ type: 'user/get_info/done', payload: response })
  }
  return server.undo(action, meta, 'Unknown error')
}
export default getUserInfo
