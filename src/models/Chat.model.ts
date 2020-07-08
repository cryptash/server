import { Model, DataTypes } from 'sequelize'
import jwt from 'jsonwebtoken'
import * as config from '../config.json'
import sequelize from '../lib/db_connect'
class Chat extends Model {
  chat_id!: string
  name!: string
  messages!: string[]
  users!: Array<{
    role: string
    id: string
    joined: String
  }>
  created_at!: String
  type!: 'PRIVATE' | 'GROUP'
  picture_url!: string
}
Chat.init(
  {
    chat_id: DataTypes.TEXT,
    name: DataTypes.TEXT,
    messages: DataTypes.ARRAY(DataTypes.TEXT),
    users: DataTypes.TEXT,
    created_at: DataTypes.TEXT,
    type: DataTypes.TEXT,
    picture_url: DataTypes.TEXT
  },
  { tableName: 'Chats', sequelize }
)
export default Chat
