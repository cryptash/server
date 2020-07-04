import User from '../models/User.model'
import bcrypt from 'bcrypt'
import nanoid from 'nanoid'
const Register = async (req: any, res: any) => {
  console.log(req.body)
  let pass_regexp = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,31}$/ // 8 to 31 characters which contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character
  if (!req.body.password.match(pass_regexp))
    return { 422: { text: "Password doesn't meet requirements" } }
  if (await User.findOne({ where: { username: req.body.username } }))
    return { 409: { text: 'Username is already taken' } }
  const user = new User({
    username: req.body.username.toLowerCase(),
    password: bcrypt.hashSync(req.body.password, 10),
    chats: [],
    user_id: nanoid.nanoid(21),
    pub_key: req.body.pub_key,
    created_at: new Date().toString(),
    last_fetched: new Date().toString(),
    notified: true
  })
  try {
    await user.save()
  } catch (e) {
    if (e) return console.log(e)
  }
  return { 200: user.toAuthJSON() }
}
export default Register
