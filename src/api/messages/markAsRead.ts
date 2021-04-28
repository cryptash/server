import Chat from '../../models/Chat.model'
import MessageModel from '../../models/Message.model'
import jwt from 'jsonwebtoken'
import * as config from '../../config.json'
import { nanoid } from 'nanoid'
const markAsRead = async (
  message: {
    chatId: string
    messageId: string
    token: string
  },
  ws_clients: any
) => {
  const token: any = jwt.verify(message.token, config.secret)
  if (!token) {
    return
  }
  console.log('read')
  const chat = await Chat.findOne({
    where: {
      chat_id: message.chatId
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
    const msg = messages.filter(x => x.message_id === message.messageId)[0]
    if (msg.read) {
        return
    }
    if (msg.to === token.user_id){
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
    try {
      // @ts-ignore
      ws_clients[msg.to].forEach((ws: { connection: { send: (_: string) => any } })=> ws.connection.send(
        JSON.stringify({
          action: 'message_read_by_me',
          data: {
            statusCode: 200,
            message_id: msg.message_id,
            chat_id: msg.chat_id,
          }
        })
      ))
    } catch (e) {
    }
    try {
      // @ts-ignore
      ws_clients[msg.from].forEach((ws: { connection: { send: (_: string) => any } })=> ws.connection.send(
        JSON.stringify({
          action: 'message_read_by_user',
          data: {
            statusCode: 200,
            message_id: msg.message_id,
            chat_id: msg.chat_id,
          }
        })
      ))
    } catch (e) {
    }
    return msg
  }

}
export default markAsRead
