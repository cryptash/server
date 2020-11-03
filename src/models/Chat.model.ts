import { Model, DataTypes } from 'sequelize'
import jwt from 'jsonwebtoken'
import * as config from '../config.json'
import sequelize from '../lib/db_connect'
class Chat extends Model {
  chat_id!: string
  messages!: Array<{
      id: string,
      content: string,
      date: string,
      by: string,
      attachments: Array<{
          url: string,
      }>
  }>
  users!: Array<{
    id: string
  }>
}
Chat.init(
  {
    chat_id: DataTypes.TEXT,
    messages: DataTypes.ARRAY(DataTypes.TEXT),
    users: DataTypes.TEXT,
  },
  { tableName: 'Chats', sequelize }
)
export default Chat
