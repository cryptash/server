import {
  Model,
  DataTypes,
  HasManyGetAssociationsMixin,
  Association,
  HasManyAddAssociationMixin,
  HasManyHasAssociationMixin
} from 'sequelize'
import sequelize from '../lib/db_connect'
import User from './User.model'
import Message from './Message.model'

class Chat extends Model {
  chat_id!: string
  users!: Array<string> | string
  messageAt!: Date
  messages!: Array<Message>
  public getMessages!: HasManyGetAssociationsMixin<Message>
  public addMessages!: HasManyAddAssociationMixin<Message, number>
  public hasMessages!: HasManyHasAssociationMixin<Message, number>
  public static associations: {
    projects: Association<Chat, Message>
  }
}
Chat.init(
  {
    chat_id: DataTypes.TEXT,
    messageAt: DataTypes.DATE,
    users: DataTypes.ARRAY(DataTypes.TEXT)
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
