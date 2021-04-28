import Chat from '../../models/Chat.model'
import MessageModel from '../../models/Message.model'
import jwt from 'jsonwebtoken'
import * as config from '../../config.json'
import { nanoid } from 'nanoid'
const SendMessage = async (
  message: {
    chatId: string
    content: string
    token: string
  },
  ws_clients: any
) => {
  const token: any = jwt.verify(message.token, config.secret)
  if (!token) {
    return
  }
  console.log('create')
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
      from: token.user_id,
      to: users.filter((x: string) => x !== token.user_id)[0],
      content: message.content,
      read: false,
      date: new Date(),
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
    try {
      // @ts-ignore
      msg.dataValues.isMe = false
      ws_clients[msg.to].forEach((ws: { connection: { send: (_: string) => any } })=> ws.connection.send(
        JSON.stringify({
          action: 'new_message',
          data: {
            statusCode: 200,
            message: msg
          }
        })
      ))
    } catch (e) {
    }
    try {
      // @ts-ignore
      msg.dataValues.isMe = true
      ws_clients[msg.from].forEach((ws: { connection: { send: (_: string) => any } })=> ws.connection.send(
          JSON.stringify({
            action: 'new_message',
            data: {
              statusCode: 200,
              message: msg
            }
          })
      ))
    } catch (e) {
    }
    return msg
  }

}
export default SendMessage
