const replaceText = (reg, str, rep = '') => {
	return str.replace(reg, rep)
}
const createQuery = (queries = {}) => {
	const q = Object.entries(queries).map(([key, value]) => `${key}=${value}`)

	return '?' + q.join('&')
}

export { replaceText, createQuery }
