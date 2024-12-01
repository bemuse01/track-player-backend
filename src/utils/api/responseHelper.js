const defaultMessage = (status) => {
	switch (status) {
		case 200: {
			return 'Success.'
		}
		case 204: {
			return 'No Content.'
		}
		case 404: {
			return 'Not Found.'
		}
		case 500: {
			return 'Internal Server Error.'
		}
		default: {
			return ''
		}
	}
}
const schema = (status, data = null, msg = null) => ({
	status,
	response: {
		code: status,
		data,
		message: msg || defaultMessage(status),
	},
})

const ResponseHelper = {
	OK: (data, msg) => schema(200, data, msg),
	NO_CONTENT: (msg) => schema(204, null, msg),
	NOT_FOUND: (msg) => schema(404, null, msg),
	INTERNAL_SERVER_ERROR: (msg) => schema(500, null, msg),
}

export default ResponseHelper
