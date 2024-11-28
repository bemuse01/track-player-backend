const rootShema = {
    querystring: {
        type: 'object',
        properties: {
            name: { type: 'string', default: 'name' },
        },
    },
    response: {
        200: {
            type: 'object',
            properties: {
                hello: { type: 'string' },
            },
        },
    },
}

const rootHandler = async (request, reply) => {
    const { name } = request.query
    const msg = 'world, ' + name

    return { hello: msg }
}
const root = async (fastify, options) => {
    fastify.route({
        method: 'GET',
        url: '/',
        schema: rootShema,
        handler: rootHandler,
    })
}

export default root
