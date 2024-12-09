import { getAllPlaylists } from '../../models/playlist/index.js'
import ResponseHelper from '../../utils/api/responseHelper.js'

const method = 'GET'
const url = '/playlist'
const responseSchema = {
	type: 'object',
	properties: {
		code: { type: 'number', nullable: true },
		data: { type: 'array', nullable: true },
		message: { type: 'string', nullable: true },
	},
}

const schema = {
	querystring: {
		type: 'object',
		properties: {
			// playlistId: {type: 'string'},
		},
	},
	response: {
		200: responseSchema,
		500: responseSchema,
	},
}

const handler = async (request, reply) => {
	try {
		const playlists = await getAllPlaylists()

		const { status, response } = ResponseHelper.OK(playlists)

		reply.status(status).send(response)
	} catch (err) {
		console.log(err)

		const { status, response } = ResponseHelper.INTERNAL_SERVER_ERROR(err)

		reply.status(status).send(response)
	}
}

const playlist = { method, url, schema, handler }

export { playlist }
