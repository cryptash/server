import fastify from 'fastify'
import ws from 'ws'
const server = fastify()
const wss = new ws.Server({ server: server.server })
wss.on('connection', function connection(ws) {
  console.log('new connection')
  ws.on('message', function incoming(message) {
    console.log('received: %s', message)
  })
  ws.send('something')
})
server.get('/ping', async (request, reply) => {
  return 'pong\n'
})

server.listen(8080, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
})
