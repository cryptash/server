import Chat from '../../models/Chat.model'
import MessageModel from '../../models/Message.model'
import jwt from 'jsonwebtoken'
import * as config from '../../config.json'
import { nanoid } from 'nanoid'
import {BaseServer, Context, ServerMeta} from "@logux/server";
const markAsRead = async (ctx: Context, action: any, meta: ServerMeta, server: BaseServer) => {
  const chat = await Chat.findOne({
    where: {
      chat_id: action.payload.chat_id
    },
    include: [
      {
        model: MessageModel,
        as: 'Messages'
      }
    ]
  })
  const messages = await chat?.getMessages()
  if (!chat) return
  let users = chat.users
  if (typeof chat.users === 'string') {
    users = JSON.parse(chat.users.replace('{', '[').replace('}', ']'))
  }
  // @ts-ignore
  if (typeof chat.users === 'string') {
    console.log()
  }
  if (typeof users !== "string" && messages) {
    const msg = messages.filter(x => x.message_id === action.payload.message_id)[0]
    if (msg.read) {
        return
    }
    if (msg.to === ctx.userId){
        msg.read = true
    }
    else {
        return
    }
    // const secondUser = users.filter((x: string) => x !== token.user_id)[0]
    console.log(msg)
    try {
      await msg.save()
    } catch (e) {
      console.log('save')
      console.log(e)
    }
    return msg
  }

}
export default markAsRead
