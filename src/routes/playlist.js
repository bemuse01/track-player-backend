import { getPlaylist } from '../controllers/playlist/index.js'

const playlist = async (fastify, options) => {
	fastify.route(getPlaylist)
}

export default playlist
