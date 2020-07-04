// import { Document, Model, model, Types, Schema, Query } from 'mongoose'
// import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import { Model, DataTypes, Sequelize, Optional } from 'sequelize'
import jwt from 'jsonwebtoken'
import * as config from '../config.json'
// import { IChatSchema } from './Chat.model'
import sequelize from '../lib/db_connect'
class User extends Model {
  username!: string
  password!: string
  notified!: boolean
  created_at!: Date
  last_fetched!: Date
  pub_key!: string
  user_id!: string
  chats!: string[]
  toAuthJSON!: () => { user_id: string; token: string }
  generateJWT!: () => string
  validatePassword!: (pass: string) => boolean
  updatePassword!: (new_pass: string, old_pass: string) => 200 | 403
  setPassword!: (pass: string) => void
}
User.init(
  {
    username: { type: DataTypes.TEXT },
    password: DataTypes.TEXT,
    notified: DataTypes.BOOLEAN,
    created_at: DataTypes.TEXT,
    last_fetched: DataTypes.TEXT,
    pub_key: DataTypes.TEXT,
    user_id: DataTypes.TEXT,
    chats: DataTypes.ARRAY(DataTypes.TEXT)
  },
  { tableName: 'Users', sequelize }
)
// export const UserSchema = new Schema({
//   username: {
//     type: String,
//     unique: true,
//     required: true,
//     lowercase: true
//   },
//   password: {
//     type: String,
//     required: true
//   },
//   created_at: {
//     type: Date,
//     required: true
//   },
//   last_fetched: {
//     type: Date
//   },
//   notified: {
//     type: Boolean
//   },
//   user_id: {
//     type: String
//   },
//   pub_key: {
//     type: String,
//     required: true
//   },
//   chats: {
//     type: Array,
//     required: true
//   }
// })
User.prototype.setPassword = function (pass: string) {
  this.password = bcrypt.hashSync(pass, 10)
}
User.prototype.updatePassword = function (new_pass: string, old_pass: string) {
  if (!this.validatePassword(old_pass)) return 403
  this.password = bcrypt.hashSync(new_pass, 10)
  return 200
}
User.prototype.validatePassword = function (pass: string) {
  return bcrypt.compareSync(pass, this.password)
}
User.prototype.generateJWT = function () {
  const today = new Date()
  const expirationDate = new Date(today)
  expirationDate.setDate(today.getDate() + 60)

  return jwt.sign(
    {
      username: this.username,
      user_id: this.user_id,
      exp: parseInt((expirationDate.getTime() / 1000).toString(), 10)
    },
    config.secret
  )
}
User.prototype.toAuthJSON = function () {
  return {
    user_id: this.user_id,
    token: this.generateJWT()
  }
}

// const User = mongoose.model<IUserSchema>('User', UserSchema)
export default User
