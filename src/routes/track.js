import { getAllTracksByPlaylistId } from '../controllers/trackControllers.js'



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
                test: {type: 'string'}
            }
        }
    }
}
const getHandler = async (request, reply) => {
    // const {artist, title} = request.query
    reply.send({test: 'get'})
}
const get = {
    method: 'GET',
    url: '/track',
    schema: getShema,
    handler: getHandler
}



// post
const postSchema = {
    body: {
        type: 'object',
        // required: ['playlistId'],
        properties: {
            // playlistId: {type: 'string'}
        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                tracks: {type: 'array'}
            }
        }
    }
}
const postHandler = async (request, reply) => {
    const {playlistId} = request.params

    console.log(playlistId)

    const tracks = await getAllTracksByPlaylistId(playlistId)

    reply.send({tracks})
}
const post = {
    method: 'POST',
    url: '/track/:playlistId',
    schema: postSchema,
    handler: postHandler
}



const track = async (fastify, options) => {

    fastify.route(get)
    
    fastify.route(post)

}


export default track