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
import getUserInfo from './api/user/getUserInfo'
import createChat from './api/chat/createChat'
import {getMessages} from "./api/chat/getMessages"
import path from 'path'
import * as http from "http";
import markAsRead from './api/messages/markAsRead';

connection.sync()
const port: number = config.port || 8080
const clients: {[key: string]: any[]} = {}
const server = fastify()

server.register(fastifyCors, {
  origin: '*'
})
server.register(require('fastify-static'), {
  root: path.join(__dirname, '../client/dist'),
  wildcard: false,
})

const wss = new ws.Server({ server: server.server })
wss.on('connection', function connection(ws: any) {
  console.log('new connection')
  let token: any
  let id: number
  ws.on('message', async function incoming(message: any) {
    message = JSON.parse(message)
    if (message.action === 'register') {
      token = jwt.verify(message.jwt, config.secret)
      if (!token)
        ws.send(
          JSON.stringify({
            statusCode: 401,
            error: 'Unauthorized',
            message: 'Invalid token'
          })
        )
      if (!clients[token.user_id]) {
        clients[token.user_id] = []
      }
      clients[token.user_id].push({
        user_id: token.user_id,
        connection: ws,
        isAlive: true
      })
      id = clients[token.user_id].length - 1
      ws.send(
        JSON.stringify({
          action: 'info',
          data: {
            statusCode: 200,
            user_id: token.user_id,
            message: 'Successful connection'
          }
        })
      )
      console.log(clients)
    }
    if (message.action === 'send_message') {
      delete message.action
      await SendMessage(message, clients)
    }
    if (message.action === 'get_messages') {
      delete message.action
      ws.send(JSON.stringify(await getMessages(
          message.chat_id,
          message.jwt,
          message.pg,
      )))
    }
    if (message.action === 'search_users') {
      delete message.action
    }
    if (message.action === 'mark_as_read'){
      delete message.action
      await markAsRead(message, clients)
    }
  })
  ws.on('pong', function () {
    if (clients[token.user_id][id])
      clients[token.user_id][id].isAlive = true
    console.log(token.user_id)
  })
})
const interval = setInterval(function ping() {
  Object.keys(clients).map((key) => {
    let ws;
    clients[key].forEach((ws: { isAlive: boolean; connection: { terminate: () => void; ping: () => void; }; user_id: string | number; }) => {
      if (!ws.isAlive) {
        ws.connection.terminate()
        delete clients[ws.user_id]
        return
      }
      ws.isAlive = false
      ws.connection.ping()
    })
  })
}, 15000)
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
server.post(
  '/api/login',
  async (
    request:  FastifyRequest<{
      Body: {
        username: string,
        password: string,
      },
    }>,
    reply: FastifyReply<http.Server>
  ) => {
    return await Login(request, reply);
  }
)
server.post(
  '/api/register',
  async (
    request:  FastifyRequest<{
      Body: {
        username: string,
        password: string,
        pub_key: string,
      },
    }>,
    reply: FastifyReply<http.Server>
  ) => {
    await Register(request, reply)
  }
)
server.post(
  '/api/users/getKey',
  async (
    request:  FastifyRequest<{
      Body: {
        user_id: string
      },
    }>,
    reply: FastifyReply<http.Server>
  ) => {
    await getKey(request, reply)
  }
)
server.post(
  '/api/users/search',
  async (
    request:  FastifyRequest<{
      Body: {
        query: string
      },
    }>,
    reply: FastifyReply<http.Server>
  ) => {
    await searchUsers(request, reply)
  }
)
server.post(
  '/api/checkAuth',
  async (
    request:  FastifyRequest<{
      Body: {
        token: string
      },
    }>,
    reply: FastifyReply<http.Server>
  ) => {
    await checkAuth(request, reply)
  }
)
server.post(
  '/api/users/getInfo',
  async (
    request:  FastifyRequest<{
      Body: {
        user_id: string
      },
    }>,
    reply: FastifyReply<http.Server>
  ) => {
    await getUserInfo(request, reply)
  }
)
server.post(
  '/api/chat/create',
  async (
    request:  FastifyRequest<{
      Body: {
        user_id: string
      },
    }>,
    reply: FastifyReply<http.Server>
  ) => {
    await createChat(request, reply)
  }
)
server.listen(port, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
})
