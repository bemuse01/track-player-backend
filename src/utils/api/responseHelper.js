const ResponseHelper = {
    OK: (data, message) => ({
        code: 200,
        response: {
            data,
            error: null,
            message: message || 'Success.',
        },
    }),
    NO_CONTENT: (message) => ({
        code: 204,
        response: {
            data: null,
            error: null,
            message: message || 'No Content.',
        },
    }),
    NOT_FOUND: (message) => ({
        code: 404,
        response: {
            data: null,
            error: null,
            message: message || 'Not Found.',
        },
    }),
    INTERNAL_SERVER_ERROR: (error) => ({
        code: 500,
        response: {
            data: null,
            error: error || 'Internal Server Error.',
            message: 'Internal Server Error.',
        },
    }),
}

export default ResponseHelper
