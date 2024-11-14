import { getAllPlaylists } from '../controllers/playlistController.js'


// get
const getShema = {
    querystring: {
        type: 'object',
        properties: {
            // playlistId: {type: 'string'},
        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                playlists: {type: 'array'}
            }
        }
    }
}
const getHandler = async (request, reply) => {
    const playlists = await getAllPlaylists()

    reply.send({playlists})
}
const get = {
    method: 'GET',
    url: '/playlist',
    schema: getShema,
    handler: getHandler
}


const playlist = async (fastify, options) => {

    fastify.route(get)

}


export default playlist