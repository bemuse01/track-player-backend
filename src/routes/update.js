import { getAllPlaylists } from '../controllers/playlistController.js'

// get
const getShema = {
    querystring: {
        type: 'object',
        properties: {
            // playlistId: {type: 'string'},
        },
    },
    response: {
        200: {
            type: 'object',
            properties: {
                playlists: { type: 'array' },
            },
        },
        201: {
            type: 'object',
            properties: {
                message: { type: 'string' },
            },
        },
        500: {
            type: 'object',
            properties: {
                error: { type: 'string' },
            },
        },
    },
}
const getHandler = (fastify) => async (request, reply) => {
    try {
        const redis = fastify.redis
        const isWorking = await redis.get('isWorking')

        if (isWorking === 'true') {
            reply.status(201).send({ message: 'worker is arleady working' })
        } else {
            const trackWorker = request.diScope.resolve('jobWorker')
            await trackWorker.doWork()

            const playlists = await getAllPlaylists()

            reply.status(200).send({ playlists })
        }
    } catch (err) {
        console.log(err)
        reply.status(500).send({ error: 'internal server error' })
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
