import { getRoot } from '../controllers/root/index.js'

const root = async (fastify, options) => {
	fastify.route(getRoot)
}

export default root
