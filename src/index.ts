import jwt from 'jsonwebtoken'
import connection from './lib/db_connect.js'
import config from './config.json'
import SendMessage from './api/messages/send.js'
import searchUsers from './api/searchUsers.js'
import getUserInfo from './logux/User/GetInfo.js'
import createChat from './api/chat/createChat.js'
import {getMessages} from "./logux/Chat/getMessages.js"
import path from 'path'
import express from 'express'
import markAsRead from './api/messages/markAsRead.js';
import { Server } from '@logux/server'
import type { BaseServer } from '@logux/server'
import {LoginLogux} from "./logux/login.js";
import {Check} from "./logux/User/Check.js";
import Chat from "./models/Chat.model.js";
import User from "./models/User.model.js";
import {RegisterLogux} from "./logux/register.js";
import * as fs from "fs";
connection.sync()
const port: number = config.port || 8080

const app = express()
const staticDir = path.join('./client/dist')

app.use(express.static(staticDir, { index: false }))
app.get('*', function (_, response) {
  response.sendFile(path.resolve(staticDir, 'index.html'))
})

const httpServer = app.listen(port)

// const _on = httpServer.on
// httpServer.on = (event: any, listener: any) => {
//   if (event === 'request') return httpServer
//   return _on.call(httpServer, event, listener)
// }

const loguxServer: BaseServer = new Server(
  Server.loadOptions(process, {
    subprotocol: '1.0.0',
    supports: '1.x',
    root: import.meta.url,
    server: httpServer
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
const html = fs.readFileSync('./client/dist/index.html')
loguxServer.http((req, res) => {
  console.log(req)
  res.writeHead(200, {"Content-Type": "text/html"})
  res.write(html)
  res.end()
})

loguxServer.listen()