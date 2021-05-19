import seq from 'sequelize'
import config from '../config.json'
console.log(config.db_host)
const conString = `postgres://${config.db_user}:${config.db_pass}@${config.db_host}/${config.db_name}`

export default new seq.Sequelize(conString)
