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
        500: responseSchema,
    },
}
const getHandler = async (request, reply) => {
    try {
        const playlists = await getAllPlaylists()

        const { code, response } = ResponseHelper.OK(playlists)

        reply.status(code).send(response)
    } catch (err) {
        console.log(err)

        const { code, response } = ResponseHelper.INTERNAL_SERVER_ERROR(err)

        reply.status(code).send(response)
    }
}
const get = {
    method: 'GET',
    url: '/playlist',
    schema: getShema,
    handler: getHandler,
}

const playlist = async (fastify, options) => {
    fastify.route(get)
}

export default playlist
