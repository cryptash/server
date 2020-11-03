import jwt from "jsonwebtoken";
import * as config from "../config.json";
import fastify from "fastify";
const checkAuth = async (req: fastify.FastifyRequest, res: fastify.FastifyReply<object>) => {
    console.log(req.body)
    try {
        const token = jwt.verify(req.body.token, config.secret)
        if (!token) {
            res.status(401).send({
                statusCode: 401,
                error: 'Unauthorized',
                message: 'Invalid token'
            })
            return
        } else {
            res.status(200).send({
                statusCode: 200
            })
            return
        }
    }
    catch (e) {
        res.status(401).send({
            statusCode: 401,
            error: 'Unauthorized',
            message: 'Invalid token'
        })
        return
    }
    res.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error'
    })
}
export default checkAuth
