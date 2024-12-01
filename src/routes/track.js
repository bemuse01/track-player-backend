import { getTracks } from '../controllers/track/index.js'

const track = async (fastify, options) => {
	fastify.route(getTracks)
}

export default track
