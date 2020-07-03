import User from '../models/User.model'
import { Connection } from 'mongoose'
const Login = async (req: any, res: any) => {
  const user = await User.findOne({ username: req.body.username })
  console.log(user)
  if (!user) {
    return { 400: { text: 'No user found' } }
  }
  if (!user.validatePassword(req.body.password))
    return { 403: { text: 'Wrong password' } }
  else return { 200: user.toAuthJSON() }
}
export default Login
