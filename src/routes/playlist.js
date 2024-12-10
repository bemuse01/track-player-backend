import { postPlaylistLimit } from '../controllers/playlist/index.js'

const playlist = async (fastify, options) => {
	fastify.route(postPlaylistLimit)
}

export default playlist
