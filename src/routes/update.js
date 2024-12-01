import { readFile } from 'fs/promises'
import { getAllPlaylists } from '../controllers/playlistController.js'
import ResponseHelper from '../utils/api/responseHelper.js'

// get
const responseSchema = {
	type: 'object',
	properties: {
		error: { type: 'string', nullable: true },
		data: { type: 'array', nullable: true },
		message: { type: 'string', nullable: true },
	},
}
const getShema = {
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
const getHandler = (fastify) => async (request, reply) => {
	try {
		await readFile('./ds/dsdsads')
		// reply.status(code).send(response)
		// throw new Error('TEST ERROR')
		// const redis = fastify.redis
		// const isWorking = await redis.get('isWorking')

		// if (isWorking === 'true') {
		//     const { code, response } = ResponseHelper.NO_CONTENT('Update in progress.')

		//     reply.status(code).send(response)
		// } else {
		//     const trackWorker = request.diScope.resolve('jobWorker')
		//     await trackWorker.doWork()

		//     const playlists = await getAllPlaylists()
		//     const { code, response } = ResponseHelper.OK(playlists, 'Update complete.')

		//     reply.status(code).send(response)
		// }
	} catch (err) {
		console.log(err.message)

		const { code, response } = ResponseHelper.INTERNAL_SERVER_ERROR(err)

		reply.status(code).send(response)
	}
}
const get = (fastify) => ({
	method: 'GET',
	url: '/update',
	schema: getShema,
	handler: getHandler(fastify),
})

const update = async (fastify, options) => {
	fastify.route(get(fastify))
}

export default update
