import User from '../models/User.model'
import sequelize from 'sequelize'
import jwt from 'jsonwebtoken'
import * as config from '../config.json'
import { FastifyReply, FastifyRequest } from 'fastify'
import * as http from "http";
import {BaseServer, Context, ServerMeta} from "@logux/server";

const searchUsers = async (
  ctx: Context,
  action:{
    type: 'users/search',
    payload: {
      query: string
    }},
  meta: ServerMeta,
  server: BaseServer
) => {
  const query = action.payload.query.toLowerCase()
  if (query.length < 3) {
    server.undo(meta, 'Query must be longer than 3')
    return
  }
  const users = await User.findAll({
    where: {
      username: sequelize.where(
        sequelize.fn('LOWER', sequelize.col('username')),
        'LIKE',
        '%' + query + '%'
      )
    }
  })
  const result: {
    username: string
    user_id: string
    picture: string
  }[] = []
  users.map((user) => {
    if (user.user_id !== ctx.userId)
      result.push({
        username: user.username,
        user_id: user.user_id,
        picture: user.picture_url
      })
  })
  ctx.sendBack({
    type: 'users/search/done',
    payload: {
      users: result,
      count: result.length
    }
  })
  return
}
export default searchUsers
