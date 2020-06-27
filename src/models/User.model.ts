import { Document, Model, model, Types, Schema, Query } from 'mongoose'
import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import * as config from '../config.json'
import { IChatSchema } from './Chat.model'
export const UserSchema = new Schema({
  username: {
    type: String,
    unique: true,
    required: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  created_at: {
    type: Date,
    required: true
  },
  last_fetched: {
    type: Date
  },
  notified: {
    type: Boolean
  },
  user_id: {
    type: String
  },
  pub_key: {
    type: String,
    required: true
  },
  chats: {
    type: Array,
    required: true
  }
})
UserSchema.methods.setPassword = function (pass: string) {
  this.password = bcrypt.hashSync(pass, 10)
}
UserSchema.methods.updatePassword = function (
  new_pass: string,
  old_pass: string
) {
  if (!this.validatePassword(old_pass)) return 403
  this.password = bcrypt.hashSync(new_pass, 10)
  return 200
}
UserSchema.methods.validatePassword = function (pass: string) {
  return bcrypt.compareSync(pass, this.password)
}
UserSchema.methods.generateJWT = function () {
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
UserSchema.methods.toAuthJSON = function () {
  return {
    user_id: this.user_id,
    token: this.generateJWT()
  }
}
export interface IUserSchema extends Document {
  username: string
  password: string
  notified: boolean
  created_at: Date
  last_fetched: Date
  pub_key: string
  user_id: string
  chats: Array<IChatSchema>
  validatePassword: any
  toAuthJSON: any
}
const User = mongoose.model<IUserSchema>('User', UserSchema)
export default User
