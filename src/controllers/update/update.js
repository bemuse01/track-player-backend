// TODO 사용자 수동 업데이트: 전체 리스트 업데이트에서 개별 리스트 업데이트로 변경
// import { readFile } from 'node:fs/promises'
import { getAllPlaylists } from '../../models/playlist/index.js'
import ResponseHelper from '../../utils/api/responseHelper.js'

const method = 'POST'
const url = '/update'
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
		204: responseSchema,
		500: responseSchema,
	},
}

const handler = (fastify) => async (request, reply) => {
	try {
		// await readFile('./ds/dsdsads')
		// const { status, response } = ResponseHelper.CONFLICT('Update in progress.')
		// reply.status(status).send(response)

		const redis = fastify.redis
		const isWorking = await redis.get('isWorking')

		if (isWorking === 'true') {
			const { status, response } = ResponseHelper.CONFLICT('Update in progress.')

			reply.status(status).send(response)
		} else {
			const trackWorker = request.diScope.resolve('jobWorker')
			await trackWorker.doWork()

			const playlists = await getAllPlaylists()
			const { status, response } = ResponseHelper.OK(playlists, 'Update complete.')

			reply.status(status).send(response)
		}
	} catch (err) {
		console.log(err)

		const { status, response } = ResponseHelper.INTERNAL_SERVER_ERROR()

		reply.status(status).send(response)
	}
}

const postUpdate = (fastify) => ({
	method,
	url,
	schema,
	handler: handler(fastify),
})

export { postUpdate }
