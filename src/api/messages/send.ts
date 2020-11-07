import Chat from "../../models/Chat.model";
import MessageModel from "../../models/Message.model";
import jwt from "jsonwebtoken";
import * as config from "../../config.json";
import {nanoid} from "nanoid";
const SendMessage = async (
    message: {
      chatId: string,
      to: string,
      content: string,
      token: string,
    },
    ws_clients: any,
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
    include: [{
      model: MessageModel,
      as: 'Messages'
    }]
  })
  // @ts-ignore
  console.log(chat.messages)
  const msg = new MessageModel({
    chat_id: chat?.chat_id,
    from: token.user_id,
    to: message.to,
    content: message.content,
    read: false,
    date: new Date(),
    message_id: nanoid(21)
  })
  try {
    await msg.save()
  }
  catch (e) {
    console.log('save')
    console.log(e)
  }
  try {
    // @ts-ignore
    chat.addMessage(msg)
  }
  catch (e) {
    console.log('msg')
    console.log(e)
  }
  return msg
}
export default SendMessage
