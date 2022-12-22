import type { BaseServer } from '@logux/server'
import { Context, ServerMeta } from '@logux/server'
import User from '../../models/User.model.js'
import Chat from '../../models/Chat.model.js'
import seq from 'sequelize'

const getOnlineUsers = async (
  ctx: Context,
  action: {
    type: 'users/getOnline'
  },
  meta: ServerMeta,
  server: BaseServer
) => {
  const connectedUserIds: string[] = []
  for (let client of server.connected.values()) {
    connectedUserIds.push(client.userId)
  }
  const user = await User.findOne({
    where: {
      user_id: ctx.userId
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
            model: User,
            required: false,
            attributes: ['pub_key', 'user_id', 'picture_url', 'username'],
            where: {
              [seq.Op.not]: [{ user_id: ctx.userId }]
            }
          }
        ]
      }
    ]
  })
  const result: Array<{
    user_id: string
    status: 'OFFLINE' | 'ONLINE'
  }> = []
  user['Chats'].forEach((chat) => {
    if (connectedUserIds.find(chat['Users'][0].user_id)) {
      result.push({
        user_id: chat['Users'][0].user_id,
        status: 'ONLINE'
      })
    } else {
      result.push({
        user_id: chat['Users'][0].user_id,
        status: 'OFFLINE'
      })
    }
  })
  ctx.sendBack({
    type: 'users/getOnline/done',
    payload: {
      status: result
    }
  })
}

export { getOnlineUsers }
