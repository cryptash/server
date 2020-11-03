import User from '../../models/Chat.model'
import bcrypt from 'bcrypt'
import nanoid from 'nanoid'
import fastify from "fastify";

const createChat = async (req: fastify.FastifyRequest, res: fastify.FastifyReply<object>) => {
    console.log(req.body)

    const chat = new User({

    })
    try {
        await chat.save()
    } catch (e) {
        if (e) return console.log(e)
    }
    res.status(200).send({ statusCode: 200 })
}
export default Register
