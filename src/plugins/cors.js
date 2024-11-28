import fastifyCors from '@fastify/cors'
import 'dotenv/config'

const corsOption = {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}

export { fastifyCors, corsOption }
