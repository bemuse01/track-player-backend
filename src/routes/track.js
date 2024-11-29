import { findPlaylist } from '../controllers/playlistController.js'
import { getAllTracksByPlaylistId } from '../controllers/trackControllers.js'
import ResponseHelper from '../utils/api/responseHelper.js'

// post
const responseSchema = {
    type: 'object',
    properties: {
        error: { type: 'string', nullable: true },
        data: { type: 'array', nullable: true },
        message: { type: 'string', nullable: true },
    },
}
const postSchema = {
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
const postHandler = async (request, reply) => {
    try {
        const { playlistId } = request.params
        console.log(playlistId)

        const playlist = await findPlaylist(playlistId)

        if (!playlist) {
            const { code, response } = ResponseHelper.NOT_FOUND('Invalid Playlist Id.')

            reply.status(code).send(response)
        } else {
            const tracks = await getAllTracksByPlaylistId(playlistId)

            const { code, response } = ResponseHelper.OK(tracks)

            reply.status(code).send(response)
        }
    } catch (err) {
        console.log(err)

        const { code, response } = ResponseHelper.INTERNAL_SERVER_ERROR(err)
        reply.status(code).send(response)
    }
}
const post = {
    method: 'POST',
    url: '/track/:playlistId',
    schema: postSchema,
    handler: postHandler,
}

const track = async (fastify, options) => {
    fastify.route(post)
}

export default track
