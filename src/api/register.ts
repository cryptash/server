import User from '../models/User.model'
import bcrypt from 'bcrypt'
import nanoid from 'nanoid'
import fastify, {FastifyReply, FastifyRequest} from 'fastify'
import { randomGradient } from '../lib/randomGradient'
import * as http from "http";
const Register = async (
  req:  FastifyRequest<{
    Body: {
      username: string,
      password: string,
      pub_key: string,
    },
  }>,
  res: FastifyReply<http.Server>
) => {
  console.log(req.body)
  let pass_regexp = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,31}$/ // 8 to 31 characters which contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character
  if (!req.body.password.match(pass_regexp) || !req.body.username) {
    res.status(422).send({
      statusCode: 422,
      error: 'Unprocessable Entity',
      message: "Password or Username doesn't meet requirements"
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
    pub_key: req.body.pub_key,
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
  res.status(200).send({ statusCode: 200, ...user.toAuthJSON() })
}
export default Register
