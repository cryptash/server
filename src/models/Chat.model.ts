import {
  Association,
  DataTypes,
  HasManyAddAssociationMixin,
  HasManyGetAssociationsMixin,
  HasManyHasAssociationMixin,
  Model
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
  public loadMessages!: (pg: number) => Promise<Message[]>
}
Chat.init(
  {
    chat_id: DataTypes.TEXT,
    messageAt: DataTypes.DATE,
    users: DataTypes.ARRAY(DataTypes.TEXT)
  },
  { tableName: 'Chats', sequelize }
)
Chat.prototype.loadMessages = async function(pg){
  return await this.getMessages({
    limit: 50,
    offset: pg * 50
  })
}
// Chat.hasMany(Message)
Chat.belongsToMany(User, {
  through: 'ChatUsers'
})
User.belongsToMany(Chat, {
  through: 'ChatUsers'
})
export default Chat
