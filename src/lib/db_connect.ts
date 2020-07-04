import { Sequelize } from 'sequelize'
import * as config from '../config.json'

const conString = `postgres://${config.db_user}:${config.db_pass}@${config.db_host}/${config.db_name}`

export default new Sequelize(conString)
