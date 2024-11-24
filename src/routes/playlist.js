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
        },
        500: {
            type: 'string',
            properties: {
                error: {type: 'string'}
            }
        }
    }
}
const getHandler = async (request, reply) => {
    try{

        const playlists = await getAllPlaylists()

        reply.send({playlists})

    }catch(err){

        console.log(err)
        reply.status(500).send({error: 'internal server error'})

    }
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