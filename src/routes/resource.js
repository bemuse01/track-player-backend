import { getResource } from '../controllers/resource/index.js'

const resource = async (fastify, options) => {
	fastify.route(getResource)
}

export default resource
