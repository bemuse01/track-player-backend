import { insertTrack } from '../controllers/trackControllers.js'

const trackShema = {
    querystring: {
        type: 'object',
        properties: {
            artist: {type: 'string', default: 'kessoku band'},
            title: {type: 'string', default: ''}
        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                id: {type: 'string'},
                arist: {type: 'string'},
                title: {type: 'string'},
                main_color: {type: 'string'},
            }
        }
    }
}
const trackHandler = async (request, reply) => {
    const {artist, title} = request.query

    const id = Math.random().toString()
    const media_file = 'media_file_url'
    const thumbnail = 'thumbnail_url'
    const main_color = Math.floor(Math.random() * 255 * 255 * 255).toString(16)
    const data = {id, artist, title, media_file, thumbnail, main_color}

    try{
        await insertTrack(data)
    }catch(err){
        console.log(err)        
    }

    return {id, artist, title, main_color}
}
const track = async (fastify, options) => {
    fastify.route({
        method: 'GET',
        url: '/track',
        schema: trackShema,
        handler: trackHandler
    })
}

export default track