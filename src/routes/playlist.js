import { getPlaylists } from '../controllers/playlist'

const playlist = async (fastify, options) => {
	fastify.route(getPlaylists)
}

export default playlist
