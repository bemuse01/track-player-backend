import { getPlaylists } from '../controllers/playlist/index.js'

const playlist = async (fastify, options) => {
	fastify.route(getPlaylists)
}

export default playlist
