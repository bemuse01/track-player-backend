import { IMAGE_FLAG, AUDIO_FLAG, IMAGE_FORMAT, AUDIO_FORMAT } from '../../config/file.js'
import { THUMBNAIL_CONTAINER_NAME, AUDIO_CONTAINER_NAME } from '../../config/const.js'
import { getTrackById } from '../../models/track/index.js'
import ResponseHelper from '../../utils/api/responseHelper.js'

const method = 'GET'
const url = '/resource'
const responseSchema = {
	type: 'object',
	properties: {
		code: { type: 'number', nullable: true },
		data: { type: 'string', nullable: true },
		message: { type: 'string', nullable: true },
	},
}

const schema = {
	querystring: {
		type: 'object',
		properties: {
			id: { type: 'string' },
			type: {
				type: 'string',
				enum: [IMAGE_FLAG, AUDIO_FLAG],
			},
		},
		required: ['id', 'type'],
	},
	response: {
		200: responseSchema,
		404: responseSchema,
		500: responseSchema,
	},
}

const getUrl = async ({ storage, id, type }) => {
	switch (type) {
		case IMAGE_FLAG: {
			const containerName = THUMBNAIL_CONTAINER_NAME
			const blobName = id + '.' + IMAGE_FORMAT
			const url = await storage.getSasUrl({ containerName, blobName })

			return url
		}
		case AUDIO_FLAG: {
			const containerName = AUDIO_CONTAINER_NAME
			const blobName = id + '.' + AUDIO_FORMAT
			const url = await storage.getSasUrl({ containerName, blobName })

			return url
		}
		default: {
			return null
		}
	}
}

const handler = async (request, reply) => {
	try {
		const { id, type } = request.query

		const storage = request.diScope.resolve('storage')

		const track = await getTrackById(id)
		const url = await getUrl({ storage, id, type })

		if (!track || !url) {
			const { status, response } = ResponseHelper.NOT_FOUND(`Resouce Not Found: ${type}`)

			reply.status(status).send(response)
		} else {
			const { status, response } = ResponseHelper.OK(url)

			reply.status(status).send(response)
		}
	} catch (err) {
		console.log(err)

		const { status, response } = ResponseHelper.INTERNAL_SERVER_ERROR(err)

		reply.status(status).send(response)
	}
}

const getResource = { method, url, schema, handler }

export { getResource }
