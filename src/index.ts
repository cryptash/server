import fastify from 'fastify'
import ws from 'ws'
import jwt from 'jsonwebtoken'
// import mongoose from 'mongoose'
import pg from 'pg'
import Login from './api/login'
import * as config from './config.json'
import SendMessage from './api/messages/send'
import getKey from './api/getKey'
import Register from './api/register'
// const conString = `postgres://${config.db_user}:${config.db_pass}@${config.db_host}/${config.db_name}`
const client = new pg.Client({
  user: config.db_user,
  host: config.db_host,
  database: config.db_name,
  password: config.db_pass
})
client.connect()

console.log(client)
const port: number = config.port || 8080
const clients: any = { server: { server: true } }
const server = fastify()
const wss = new ws.Server({ server: server.server })
wss.on('connection', function connection(ws: any) {
  console.log('new connection')
  let token: any
  ws.on('message', async function incoming(message: any) {
    message = JSON.parse(message)
    if (message.action === 'register') {
      token = jwt.verify(message.jwt, config.secret)
      if (!token) ws.send(JSON.stringify({ 401: 'Invalid token' }))
      clients[token.user_id] = {
        user_id: token.user_id,
        connection: ws,
        isAlive: true
      }
      console.log(clients)
    }
    if (message.action === 'send_message') {
      delete message.action
      SendMessage(clients, message)
    }
  })
  ws.on('pong', function () {
    clients[token.user_id].isAlive = true
    console.log(token.user_id)
  })
})
const interval = setInterval(function ping() {
  Object.keys(clients).map((key) => {
    const ws = clients[key]
    if (ws.server) return
    if (ws.isAlive === false) {
      ws.connection.terminate()
      delete clients[ws.user_id]
      return
    }
    ws.isAlive = false
    ws.connection.ping()
  })
}, 15000)
server.post('/api/login', async (request, reply) => {
  reply.send(await Login(request, reply))
})
server.post('/api/register', async (request, reply) => {
  reply.send(await Register(request, reply))
})
server.post('/api/getKey', async (request, reply) => {
  reply.send(await getKey(request, reply))
})
server.listen(port, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
})
