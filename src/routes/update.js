import { postUpdate } from '../controllers/update/index.js'

const update = async (fastify, options) => {
	fastify.route(postUpdate(fastify))
}

export default update
