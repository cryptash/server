import User from '../models/User.model'
import {BaseServer, Context, ServerMeta} from "@logux/server";
import bcrypt from "bcrypt";
import nanoid from "nanoid";
import {randomGradient} from "../lib/randomGradient";
const RegisterLogux = async (ctx: Context, action: {
  type: 'register',
  username: string,
  password: string,
  pub_key: string,
  private_key: string
}, meta: ServerMeta, server: BaseServer) => {
  let pass_regexp = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,31}$/ // 8 to 31 characters which contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character
  if (!action.password.match(pass_regexp) || !action.username || action.username.length < 3) {
    server.undo(meta, "Password or Username doesn't meet requirements")
    return
  }
  if (await User.findOne({ where: { username: action.username } })) {
    server.undo(meta, 'Username is already taken')
    return
  }
  const user = new User({
    username: action.username.toLowerCase(),
    password: bcrypt.hashSync(action.password, 10),
    chats: [],
    private_key: action.private_key,
    user_id: nanoid.nanoid(21),
    pub_key: action.pub_key,
    created_at: new Date().toString(),
    last_fetched: new Date().toString(),
    notified: true,
    picture_url: randomGradient()
  })
  try {
    await user.save()
  } catch (e) {
    if (e) return console.log(e)
  }
  ctx.sendBack({ type: 'register/done', ...user.toAuthJSON(), user_id: user.user_id })
  return
}
export {RegisterLogux}
