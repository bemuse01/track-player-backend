import { postTrackLimit } from '../controllers/track/index.js'

const track = async (fastify, options) => {
	fastify.route(postTrackLimit)
}

export default track
