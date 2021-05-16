import fastify, {FastifyInstance} from 'fastify'
import {FastifyReply, FastifyRequest} from "fastify";
import ws from 'ws'
import jwt from 'jsonwebtoken'
import connection from './lib/db_connect'
import Login from './api/login'
import * as config from './config.json'
import SendMessage from './api/messages/send'
import getKey from './api/getKey'
import fastifyCors from 'fastify-cors'
import Register from './api/register'
import searchUsers from './api/searchUsers'
import checkAuth from './api/checkAuth'
import getUserInfo from './logux/User/GetInfo'
import createChat from './api/chat/createChat'
import {getMessages} from "./logux/Chat/getMessages"
import path from 'path'
import * as http from "http";
import markAsRead from './api/messages/markAsRead';
import { Server } from '@logux/server'
import type { BaseServer } from '@logux/server'
import {LoginLogux} from "./logux/login";
import {Check} from "./logux/User/Check";
import Chat from "./models/Chat.model";
import User from "./models/User.model";
import {Op} from "sequelize";
import {RegisterLogux} from "./logux/register";
connection.sync()
const port: number = config.port || 8080
const clients: {[key: string]: any[]} = {}

const server = fastify()

const loguxServer: BaseServer = new Server(
  Server.loadOptions(process, {
    subprotocol: '1.0.0',
    supports: '1.x',
    root: __dirname
  })
)

loguxServer.auth(({ userId, token }) => {
  console.log(userId)
  if (userId === 'anonymous') {
    return true
  } else {
    try {
      const data: any = jwt.verify(token, config.secret)
      console.log(userId)
      return data.user_id === userId
    } catch (e) {
      return false
    }
  }
})

loguxServer.type('login', {
  async access (ctx) {
    console.log('login')
    return ctx.userId === 'anonymous'
  },
  async process (ctx, action: {
    type: 'login',
    username: string,
    password: string,
  }, meta) {
    await LoginLogux(ctx, action, meta, loguxServer)
  }
})
loguxServer.type('register', {
  async access (ctx, action: {
    type: 'register',
    username: string,
    password: string,
    pub_key: string,
    private_key: string
  }, meta) {
    console.log('register')
    return ctx.userId === 'anonymous'
  },
  async process (ctx, action: {
    type: 'register',
    username: string,
    password: string,
    pub_key: string,
    private_key: string
  }, meta) {
    await RegisterLogux(ctx, action, meta, loguxServer)
  }
})
loguxServer.type('user/check', {
  async access (ctx) {
    return true
  },
  async process (ctx, action: {
    type: 'user/check',
    token: string
  }, meta) {
    await Check(ctx, action, meta, loguxServer)
  }
})
loguxServer.channel('user/:id', {
  access (ctx, action, meta) {
    const params: any = ctx.params
    return params.id === ctx.userId
  },
  async load (ctx, action, meta) {
    await getUserInfo(ctx, action, meta, loguxServer)
  }
})
loguxServer.channel('chat/:id', {
  async access (ctx, action, meta) {
    const params: any = ctx.params
    const chat = await Chat.findOne({
      where: {
        chat_id: params.id,
      },
      include: [
        {
          model: User,
          required: true,
          attributes: ['pub_key', 'user_id', 'picture_url', 'username'],
        }
      ]
    })
    if (chat) {
      if (chat.users[0]) {
        return chat.users.includes(ctx.userId)
      }
    }
    return false
  },
  async load (ctx, action, meta) {
    await getMessages(ctx, action, meta, loguxServer)
  }
})

loguxServer.type('chat/messages/get', {
  async access (ctx, action:{
    type: 'chat/messages/get',  payload: {
      chat_id: string, pg: number
    }}, meta) {
    const chat = await Chat.findOne({
      where: {
        chat_id: action.payload.chat_id,
      },
      include: [
        {
          model: User,
          required: true,
          attributes: ['pub_key', 'user_id', 'picture_url', 'username'],
        }
      ]
    })
    if (chat) {
      if (chat.users[0]) {
        return chat.users.includes(ctx.userId)
      }
    }
    return false
  },
  async process (ctx, action:{
    type: 'chat/messages/get',  payload: {
      chat_id: string, pg: number
    }}, meta) {
    await getMessages(ctx, action, meta, loguxServer)
  }
})
loguxServer.type('chat/message/read', {
  async access (ctx, action:{
    type: 'chat/message/read',  payload: {
      chat_id: string, message_id: string
    }}, meta) {
    const chat = await Chat.findOne({
      where: {
        chat_id: action.payload.chat_id,
      },
      include: [
        {
          model: User,
          required: true,
          attributes: ['pub_key', 'user_id', 'picture_url', 'username'],
        }
      ]
    })
    if (chat) {
      if (chat.users[0]) {
        return chat.users.includes(ctx.userId)
      }
    }
    return false
  },
  async process (ctx, action:{
    type: 'chat/message/read',  payload: {
      chat_id: string, message_id: string
    }}, meta) {
    await markAsRead(ctx, action, meta, loguxServer)
  },
  async resend (ctx, action:{
    type: 'chat/message/read',  payload: {
      chat_id: string, message_id: string
    }}, meta) {
    return {channel: `chat/${action.payload.chat_id}`}
  }
})
loguxServer.type('chat/messages/send', {
  async access (ctx, action:{
    type: 'chat/messages/send',  payload: {
    content: string, chat_id: string, from: string
  }}, meta) {
    const chat = await Chat.findOne({
      where: {
        chat_id: action.payload.chat_id,
      },
      include: [
        {
          model: User,
          required: true,
          attributes: ['pub_key', 'user_id', 'picture_url', 'username'],
        }
      ]
    })
    if (chat) {
      if (chat.users[0]) {
        return chat.users.includes(ctx.userId)
      }
    }
    return false
  },
  async process (ctx, action:{
    type: 'chat/messages/send',  payload: {
      content: string, chat_id: string, from: string
    }}, meta) {
    await SendMessage(ctx, action, meta, loguxServer)
  },
})

loguxServer.type('users/search', {
  async access (ctx) {
    return ctx.userId !== 'anonymous'
  },
  async process (ctx, action: {
    type: 'users/search',
    payload: {
      query: string
    },
  }, meta) {
    await searchUsers(ctx, action, meta, loguxServer)
  }
})
loguxServer.type('chat/create', {
  async access (ctx) {
    return ctx.userId !== 'anonymous'
  },
  async process (ctx, action: {
    type: 'chat/create',
    payload: {
      user_id: string
    },
  }, meta) {
    await createChat(ctx, action, meta, loguxServer)
  }
})

server.register(fastifyCors, {
  origin: '*'
})
server.register(require('fastify-static'), {
  root: path.join(__dirname, '../client/dist'),
  wildcard: false,
})


server.get(
    '*',
    (
        request: FastifyRequest,
        reply: FastifyReply<http.Server>
    ) => {
      // @ts-ignore
      return reply.sendFile('index.html')
    }
)
// server.post(
//   '/api/login',
//   async (
//     request:  FastifyRequest<{
//       Body: {
//         username: string,
//         password: string,
//       },
//     }>,
//     reply: FastifyReply<http.Server>
//   ) => {
//     return await Login(request, reply);
//   }
// )
// server.post(
//   '/api/register',
//   async (
//     request:  FastifyRequest<{
//       Body: {
//         username: string,
//         password: string,
//         pub_key: string,
//       },
//     }>,
//     reply: FastifyReply<http.Server>
//   ) => {
//     await Register(request, reply)
//   }
// )
// server.post(
//   '/api/users/getKey',
//   async (
//     request:  FastifyRequest<{
//       Body: {
//         user_id: string
//       },
//     }>,
//     reply: FastifyReply<http.Server>
//   ) => {
//     await getKey(request, reply)
//   }
// )
// server.post(
//   '/api/users/search',
//   async (
//     request:  FastifyRequest<{
//       Body: {
//         query: string
//       },
//     }>,
//     reply: FastifyReply<http.Server>
//   ) => {
//     await searchUsers(request, reply)
//   }
// )
// server.post(
//   '/api/checkAuth',
//   async (
//     request:  FastifyRequest<{
//       Body: {
//         token: string
//       },
//     }>,
//     reply: FastifyReply<http.Server>
//   ) => {
//     await checkAuth(request, reply)
//   }
// )
// server.post(
//   '/api/users/getInfo',
//   async (
//     request:  FastifyRequest<{
//       Body: {
//         user_id: string
//       },
//     }>,
//     reply: FastifyReply<http.Server>
//   ) => {
//     await getUserInfo(request, reply)
//   }
// )
// server.post(
//   '/api/chat/create',
//   async (
//     request:  FastifyRequest<{
//       Body: {
//         user_id: string
//       },
//     }>,
//     reply: FastifyReply<http.Server>
//   ) => {
//     await createChat(request, reply)
//   }
// )
server.listen(port, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
})
loguxServer.listen()
