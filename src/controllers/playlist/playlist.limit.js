// TODO 로드할 데이터 없으면 로드 방지 추가
import { getPlaylistsByLimit } from '../../models/playlist/index.js'
import ResponseHelper from '../../utils/api/responseHelper.js'

const method = 'POST'
const url = '/playlist/limit'
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
		const { lastObjectId } = request.body

		console.log(lastObjectId)

		const playlists = await getPlaylistsByLimit(lastObjectId)

		const { status, response } = ResponseHelper.OK(playlists)

		reply.status(status).send(response)
	} catch (err) {
		console.log(err)

		const { status, response } = ResponseHelper.INTERNAL_SERVER_ERROR(err)

		reply.status(status).send(response)
	}
}

const postPlaylistLimit = { method, url, schema, handler }

export { postPlaylistLimit }
