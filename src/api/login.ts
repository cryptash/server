import User from '../models/User.model'
import { Connection } from 'mongoose'
const Login = async (req: any, res: any, db: Connection) => {
  console.log(req.body)
  const user = await User.findOne({ username: req.body.username })
  if (!user) {
    return { 403: { text: 'no user' } }
  }
  if (!(await user.validatePassword(req.body.password)))
    return { 403: { text: 'wrong password' } }
  else return { 200: { jwt: await user.toAuthJSON() } }
}
export default Login
