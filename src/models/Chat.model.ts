import { Document, Model, model, Types, Schema, Query } from 'mongoose'
export const Chat = new Schema({
  chat_id: {
    type: String
  }
})
export interface IChatSchema extends Document {
  chat_id: string
  type: 'Private' | 'Group'
}
