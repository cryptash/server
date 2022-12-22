import { createClient } from 'redis'
import config from '../config.json' assert { type: 'json' }

const redis = createClient({
  url: config['redis'],
  password: config['redis_password']
})

export default redis
