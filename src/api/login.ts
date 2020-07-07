import User from '../models/User.model'
const Login = async (req: any, res: any) => {
  const user = await User.findOne({ where: { username: req.body.username } })
  console.log(user)
  if (!user) {
    return { statusCode: 400, error: 'Bad request', message: 'No user found' }
  }
  if (!user.validatePassword(req.body.password))
    return {
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Wrong password'
    }
  else return { statusCode: 200, ...user.toAuthJSON() }
}
export default Login
