import Chat from "../../models/Chat.model";
import jwt from "jsonwebtoken";
import * as config from "../../config.json";

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
  if (!messages) {
    return {
      statusCode: 200,
      action: 'get_messages',
      messages: [],
    }
  }
  for (let i = 0; i < messages.length; i++) {
    // @ts-ignore
    messages[i].dataValues.isMe = messages[i].from === token.user_id
    console.log(messages[i])
  }
  return {
    statusCode: 200,
    action: 'get_messages',
    messages,
  }
}
