import { updateData } from '../controllers/update/index.js'

const update = async (fastify, options) => {
	fastify.route(updateData(fastify))
}

export default update
