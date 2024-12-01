import fastifyCors from '@fastify/cors'
import 'dotenv/config'

// TODO origin will be nginx domain. this will be changed later like this https://nginx-domain.com

const corsOption = {
	origin: process.env.CLIENT_URL,
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
	allowedHeaders: ['Content-Type', 'Authorization'],
	credentials: true,
}

export { fastifyCors, corsOption }
