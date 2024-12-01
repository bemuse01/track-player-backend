import fp from 'fastify-plugin'
import { createClient } from 'redis'
import { registerHandler } from '../utils/api/processHandler.js'
import 'dotenv/config'

const host = process.env.REDIS_HOST
const port = process.env.REDIS_PORT
const password = process.env.REDIS_PASSWORD

const client = createClient({
	socket: {
		host,
		port,
	},
	password,
})

const connect = async () => {
	try {
		await client.connect()
		console.log('succes to connect redis')
	} catch (err) {
		console.log('failed to connect redis', err)
	}
}

const disconnect = async (msg) => {
	await client.disconnect()
	console.log(msg + ' redis disconnected')
}

const redisConnector = fp(async (fastify, option) => {
	await connect()

	fastify.addHook('onClose', async () => disconnect('on close:'))
	registerHandler(disconnect)

	fastify.decorate('redis', client)
})

export default redisConnector
