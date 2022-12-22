import seq from 'sequelize'
const { DataTypes } = seq
import sequelize from '../lib/db_connect.js'
import User from './User.model.js'
import Message from './Message.model.js'

class Chat extends seq.Model {
  chat_id!: string
  users!: Array<string> | string
  messageAt!: Date
  messages!: Array<Message>
  public getMessages!: seq.HasManyGetAssociationsMixin<Message>
  public addMessages!: seq.HasManyAddAssociationMixin<Message, number>
  public hasMessages!: seq.HasManyHasAssociationMixin<Message, number>
  public static associations: {
    projects: seq.Association<Chat, Message>
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
Chat.prototype.loadMessages = async function (pg) {
  return await this.getMessages({
    limit: 50,
    offset: pg * 50,
    order: [['createdAt', 'DESC']]
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
