import User from '../../models/User.model'
import nanoid from 'nanoid'
import {FastifyReply, FastifyRequest} from 'fastify'
import Chat from '../../models/Chat.model'
import jwt from 'jsonwebtoken'
import * as config from '../../config.json'
import * as http from "http";
import {BaseServer, Context, ServerMeta} from "@logux/server";
import {Op} from "sequelize";

const createChat = async (
  ctx: Context,
  action:{
    type: 'chat/create',
    payload: {
      user_id: string
    }},
  meta: ServerMeta,
  server: BaseServer
) => {
  if (!action.payload.user_id) {
    server.undo(meta, "user_id can't be empty")
    return
  }
  const isChat = await Chat.findOne({
    where: {
      users: {[Op.contains]: [action.payload.user_id,ctx.userId]},
    }
  })
  if (isChat) {
    server.undo(meta, 'Chat already exists')
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
    chat_id: nanoid.nanoid(21)
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
  ctx.sendBack({type: 'chat/create/done', payload: {
    chat_id: chat.chat_id
  }})
  return
}
export default createChat
