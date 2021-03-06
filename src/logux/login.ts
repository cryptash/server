import { BaseServer, Context, ServerMeta } from '@logux/server'
import User from '../models/User.model.js'
const LoginLogux = async (
  ctx: Context,
  action: {
    type: 'login'
    username: string
    password: string
  },
  meta: ServerMeta,
  server: BaseServer
) => {
  const user = await User.findOne({ where: { username: action.username } })
  console.log(user)
  if (!user) {
    server.undo(action, meta, 'Unknown email')
    return
  }
  if (!user.validatePassword(action.password)) {
    server.undo(action, meta, 'Wrong password')
    return
  } else {
    ctx.sendBack({
      type: 'login/done',
      ...user.toAuthJSON(),
      user_id: user.user_id,
      private_key: user.private_key
    })
  }
  return
}
export { LoginLogux }
