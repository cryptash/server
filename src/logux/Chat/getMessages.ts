import seq from "sequelize";
import {BaseServer, ServerMeta} from "@logux/server";
import Chat from "../../models/Chat.model.js";
import User from "../../models/User.model.js";


interface Message {
  content: string,
  fromMe: boolean,
  date: Date,
  read: boolean,
  message_id: string
}
export const getMessages = async (ctx: any, action: any, meta: ServerMeta, server: BaseServer) => {
  const id = ctx.params ? ctx.params.id : action.payload.chat_id
  const chat = await Chat.findOne({
    where: {
      chat_id: id,
    },
    include: [
      {
        model: User,
        required: true,
        attributes: ['pub_key', 'user_id', 'picture_url', 'username'],
        where: {
          [seq.Op.not]: [{ user_id: ctx.userId }]
        }
      }
    ]
  })
  const messages = await chat?.loadMessages(action.payload ? action.payload.pg : 0)
  messages?.reverse()
  const result: {
    statusCode: number
    action: string
    messages: Message[]
    pub_key: string
  } = {
    statusCode: 200,
    action: 'get_messages',
    //@ts-ignore
    pub_key: chat['Users'][0].pub_key,
    messages: []
  }
  if (!messages) {
    return ctx.sendBack({type: 'chat/load_messages/done', payload: result})
  }
  messages.forEach(msg => {
    result.messages.push({
      //@ts-ignore
      content: msg.content,
      fromMe: msg.from === ctx.userId,
      date: new Date(msg.date),
      read: msg.read,
      message_id: msg.message_id
    })
  })
  return ctx.sendBack({type: 'chat/load_messages/done', payload: result})
}
