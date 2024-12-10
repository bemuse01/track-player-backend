const replaceText = (reg, str, rep = '') => {
	return str.replace(reg, rep)
}

const createQuery = (queries = {}) => {
	const q = Object.entries(queries).map(([key, value]) => `${key}=${value}`)

	return '?' + q.join('&')
}

const calculateDuration = (iso) => {
	const regex = /P(\d+D)?T?(\d+H)?(\d+M)?(\d+S)?/i
	const matches = iso.match(regex)
	const d = Number.parseInt(matches[1] || '0')
	const h = Number.parseInt(matches[2] || '0')
	const m = Number.parseInt(matches[3] || '0')
	const s = Number.parseInt(matches[4] || '0')
	const dateToSec = d * (1000 * 60 * 60 * 24)
	const hourToSec = h * (1000 * 60 * 60)
	const minToSec = m * (1000 * 60)
	const secToSec = s * 1000
	const duration = dateToSec + hourToSec + minToSec + secToSec
	return duration
}

export { replaceText, createQuery, calculateDuration }
