import { nanoid } from 'nanoid'
import { BaseServer, Context, ServerMeta } from '@logux/server'
import seq from 'sequelize'
import Chat from '../../models/Chat.model.js'
import User from '../../models/User.model.js'

const createChat = async (
  ctx: Context,
  action: {
    type: 'chat/create'
    payload: {
      user_id: string
    }
  },
  meta: ServerMeta,
  server: BaseServer
) => {
  if (!action.payload.user_id) {
    server.undo(action, meta, "user_id can't be empty")
    return
  }
  const isChat = await Chat.findOne({
    where: {
      users: { [seq.Op.contains]: [action.payload.user_id, ctx.userId] }
    }
  })
  if (isChat) {
    server.undo(action, meta, 'Chat already exists')
    return
  }
  const user1 = await User.findOne({
    where: {
      user_id: ctx.userId
    }
  })
  const user2 = await User.findOne({
    where: {
      user_id: action.payload.user_id
    }
  })
  console.log([user1, user2])
  const chat = new Chat({
    users: [action.payload.user_id, ctx.userId],
    chat_id: nanoid(21)
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
  ctx.sendBack({
    type: 'chat/create/done',
    payload: {
      chat_id: chat.chat_id
    }
  })
  return
}
export default createChat
