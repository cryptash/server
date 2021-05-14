import Chat from '../../models/Chat.model'
import MessageModel from '../../models/Message.model'
import jwt from 'jsonwebtoken'
import * as config from '../../config.json'
import { nanoid } from 'nanoid'
import {BaseServer, Context, ServerMeta} from "@logux/server";
const SendMessage = async (
  ctx: Context,
  action:{
    type: 'chat/messages/send',
    payload: {
      content: string, chat_id: string, from: string
    }},
  meta: ServerMeta,
  server: BaseServer
) => {
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
  if (!chat) return
  let users = chat.users
  chat.messageAt = new Date()
  if (typeof chat.users === 'string') {
    users = JSON.parse(chat.users.replace('{', '[').replace('}', ']'))
  }
  // @ts-ignore
  if (typeof chat.users === 'string') {
    console.log()
  }
  if (typeof users !== "string") {
    const msg = new MessageModel({
      chat_id: chat?.chat_id,
      from: ctx.userId,
      to: users.filter((x: string) => x !== ctx.userId)[0],
      content: action.payload.content,
      read: false,
      date: new Date(meta.time),
      message_id: nanoid(21)
    })
    console.log(msg)
    try {
      await msg.save()
    } catch (e) {
      console.log('save')
      console.log(e)
    }
    try {
      await chat.save()
      // @ts-ignore
      chat.addMessage(msg)
    } catch (e) {
      console.log('msg')
      console.log(e)
    }
    server.log.add({type: 'chat/message/create', payload: msg}, {users: [msg.from, msg.to]})
    return ctx.sendBack({type: 'chat/message/setId', payload: {id: msg.message_id, chat_id: action.payload.chat_id}})
  }

}
export default SendMessage
