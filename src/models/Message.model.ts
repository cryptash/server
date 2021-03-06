import seq from 'sequelize'
const { DataTypes } = seq
import sequelize from '../lib/db_connect.js'
import Chat from './Chat.model.js'
class Message extends seq.Model {
  chat_id!: string
  from!: string
  message_id!: string
  data!: string
  date!: string
  to!: string
  read!: boolean
  isMe!: boolean
}
Message.init(
  {
    chat_id: DataTypes.TEXT,
    content: DataTypes.TEXT,
    from: DataTypes.TEXT,
    to: DataTypes.TEXT,
    date: DataTypes.DATE,
    message_id: DataTypes.TEXT,
    read: DataTypes.BOOLEAN
  },
  { tableName: 'Messages', sequelize }
)
Message.belongsTo(Chat, {})
Chat.hasMany(Message, { as: 'Messages' })
export default Message
