import { getRoot } from '../controllers/root'

const root = async (fastify, options) => {
	fastify.route(getRoot)
}

export default root
