import { BaseServer, Context, ServerMeta } from '@logux/server'
import jwt from 'jsonwebtoken'
import User from '../../models/User.model.js'
import config from '../../config.json'
const Check = async (
  ctx: Context,
  action: {
    type: 'user/check'
    token: string
  },
  meta: ServerMeta,
  server: BaseServer
) => {
  try {
    if (!ctx.userId) return server.undo(action, meta, 'No user_id')
    const token: any = jwt.verify(action.token, config.secret)
    if (typeof token != 'string') {
      if (Date.now() >= token.exp * 1000) {
        return server.undo(action, meta, 'Token expired')
      }
    }
    const user = await User.findOne({ where: { user_id: token.user_id } })
    if (!user) {
      return server.undo(action, meta, 'Unknown user')
    }
  } catch (e) {
    console.log(e)
    return server.undo(action, meta, 'Unknown user')
  }
  return ctx.sendBack({ type: 'user/check/done' })
}
export { Check }
