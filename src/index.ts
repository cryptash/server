import fastify from 'fastify'
import ws from 'ws'
import mongoose from 'mongoose'
import login from './api/login'
import * as config from './config.json'
const port: number = config.port || 8080
mongoose.connect(`${config.db_host}/${config.db_name}`, {
  pass: config.db_pass,
  user: config.db_user,
  useNewUrlParser: true,
  useUnifiedTopology: true
})
const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', async function () {
  console.log('connected')
})
const server = fastify()
const wss = new ws.Server({ server: server.server })
wss.on('connection', function connection(ws) {
  console.log('new connection')
  ws.on('message', function incoming(message) {
    console.log('received:' + message)
  })
  ws.send('something')
})
server.post('/api/login', async (request, reply) => {
  console.log(await login(request, reply, db))
  reply.send(await login(request, reply, db))
})
server.listen(port, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
})
