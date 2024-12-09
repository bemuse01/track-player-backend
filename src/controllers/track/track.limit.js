import { findPlaylist } from '../../models/playlist/index.js'
import { getTracksByLimit } from '../../models/track/index.js'
import ResponseHelper from '../../utils/api/responseHelper.js'

const method = 'POST'
const url = '/track/limit'
const responseSchema = {
	type: 'object',
	properties: {
		code: { type: 'number', nullable: true },
		data: { type: 'array', nullable: true },
		message: { type: 'string', nullable: true },
	},
}

const schema = {
	body: {
		type: 'object',
		// required: ['playlistId'],
		properties: {
			// playlistId: {type: 'string'}
		},
	},
	response: {
		200: responseSchema,
		404: responseSchema,
		500: responseSchema,
	},
}

const handler = async (request, reply) => {
	try {
		const { playlistId, lastTrackId } = request.body
		console.log(playlistId, lastTrackId)

		const playlist = await findPlaylist(playlistId)

		if (!playlist) {
			const { status, response } = ResponseHelper.NOT_FOUND('Invalid Playlist Id.')

			reply.status(status).send(response)
		} else {
			const tracks = await getTracksByLimit(playlistId, lastTrackId)

			console.log(tracks)

			const { status, response } = ResponseHelper.OK(tracks)

			reply.status(status).send(response)
		}
	} catch (err) {
		console.log(err)

		const { status, response } = ResponseHelper.INTERNAL_SERVER_ERROR(err)

		reply.status(status).send(response)
	}
}

const postTrackLimit = {
	method,
	url,
	schema,
	handler,
}

export { postTrackLimit }
