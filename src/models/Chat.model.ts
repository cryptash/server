import { Model, DataTypes } from 'sequelize'
import sequelize from '../lib/db_connect'
import User from "./User.model";

class Chat extends Model {
  chat_id!: string
  users!: Array<string>
}
Chat.init(
  {
    chat_id: DataTypes.TEXT,
    users: DataTypes.ARRAY(DataTypes.TEXT),
  },
  { tableName: 'Chats', sequelize }
)
// Chat.hasMany(Message)
Chat.belongsToMany(User, {
  through: 'ChatUsers'
})
User.belongsToMany(Chat, {
  through: 'ChatUsers'
})
export default Chat
