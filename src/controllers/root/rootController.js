const method = 'GET'
const url = '/'
const responseSchema = {
    type: 'object',
    properties: {
        hello: { type: 'string', nullable: true },
    },
}

const schema = {
    querystring: {
        type: 'object',
        properties: {
            name: { type: 'string', default: 'name' },
        },
    },
    response: {
        200: responseSchema,
    },
}

const handler = async (request, reply) => {
    // const { name } = request.query
    // const msg = 'world, ' + name

    return { hello: 'world' }
}

const getRoot = {
    method,
    url,
    schema,
    handler,
}

export { getRoot }
