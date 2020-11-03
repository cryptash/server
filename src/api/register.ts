import User from '../models/User.model'
import bcrypt from 'bcrypt'
import nanoid from 'nanoid'
import fastify from "fastify";
const Register = async (req: fastify.FastifyRequest, res: fastify.FastifyReply<object>) => {
  console.log(req.body)
  let pass_regexp = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,31}$/ // 8 to 31 characters which contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character
  if (!req.body.password.match(pass_regexp)){
    res.status(422).send({
      statusCode: 422,
      error: 'Unprocessable Entity',
      message: "Password doesn't meet requirements"
    })
    return
  }
  if (await User.findOne({ where: { username: req.body.username } })) {
    res.status(409).send({
      statusCode: 409,
      error: 'Conflict',
      message: 'Username is already taken'
    })
    return
  }
  const user = new User({
    username: req.body.username.toLowerCase(),
    password: bcrypt.hashSync(req.body.password, 10),
    chats: [],
    user_id: nanoid.nanoid(21),
    pub_key: '',
    created_at: new Date().toString(),
    last_fetched: new Date().toString(),
    notified: true,
    picture_url:
      'https://img.techpowerup.org/200709/22-223863-no-avatar-png-circle-transparent-png.png'
  })
  try {
    await user.save()
  } catch (e) {
    if (e) return console.log(e)
  }
  res.status(200).send({ statusCode: 200, ...user.toAuthJSON() })
}
export default Register
