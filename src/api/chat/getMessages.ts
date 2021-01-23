import Chat from "../../models/Chat.model";
import jwt from "jsonwebtoken";
import * as config from "../../config.json";
interface Message {
  content: string,
  fromMe: boolean,
  date: Date,
  read: boolean,
  message_id: string
}
export const getMessages = async (chat_id: string, jwt_token: string, pg: number) => {
  const token: any = jwt.verify(jwt_token, config.secret)
  if (!token) {
    return {
      statusCode: 401,
      error: 'Unauthorized',
    }
  }
  const chat = await Chat.findOne({
    where: {
      chat_id,
    }
  })
  const messages = await chat?.loadMessages(pg)
  const result: {
    statusCode: number
    action: string
    messages: Message[]
  } = {
    statusCode: 200,
    action: 'get_messages',
    messages: []
  }
  if (!messages) {
    return result
  }
  messages.forEach(msg => {
    result.messages.push({
      //@ts-ignore
      content: msg.content,
      fromMe: msg.from === token.user_id,
      date: new Date(msg.date),
      read: msg.read,
      message_id: msg.message_id
    })
  })
  return result
}
