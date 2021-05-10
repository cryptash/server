import {BaseServer, Context, ServerMeta} from "@logux/server"
import jwt from 'jsonwebtoken'
import User from '../../models/User.model'
import * as config from '../../config.json'
const Check = async (ctx: Context, action: {
  type: 'user/check',
  token: string,
}, meta: ServerMeta, server: BaseServer) => {
  try {
    const token: any = jwt.verify(action.token, config.secret)
    if (typeof token != 'string') {
      if (Date.now() >= token.exp * 1000) {
        return server.undo(meta, 'Token expired')
      }
    }
    const user = await User.findOne({ where: { user_id: token.user_id } })
    if (!user) {
      return server.undo(meta, 'Unknown email')
    }
  }
  catch (e) {
    return server.undo(meta, 'Unknown user')
  }
  return ctx.sendBack({ type: 'user/check/done' })
}
export {Check}
