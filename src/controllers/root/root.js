import { getPlaylistCount } from '../../models/playlist/index.js'
import ResponseHelper from '../../utils/api/responseHelper.js'

const method = 'GET'
const url = '/'
const responseSchema = {
	type: 'object',
	properties: {
		code: { type: 'number', nullable: true },
		data: { type: 'number', nullable: true },
		message: { type: 'string', nullable: true },
	},
}

const schema = {
	querystring: {
		type: 'object',
		properties: {
			// name: { type: 'string', default: 'name' },
		},
	},
	response: {
		200: responseSchema,
		500: responseSchema,
	},
}

const handler = async (request, reply) => {
	try {
		const maxPlaylistCount = await getPlaylistCount()

		const { status, response } = ResponseHelper.OK(maxPlaylistCount)

		reply.status(status).send(response)
	} catch (err) {
		console.log(err)

		const { status, response } = ResponseHelper.INTERNAL_SERVER_ERROR(err)

		reply.status(status).send(response)
	}
}

const getRoot = {
	method,
	url,
	schema,
	handler,
}

export { getRoot }
