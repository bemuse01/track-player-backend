import axios from 'axios'
import { PLAYLIST_DATA_URL } from '../../config/urls.js'

const method = 'get'
const url = PLAYLIST_DATA_URL

const fetchData = async () => {
	try {
		const option = { method, url }

		const response = await axios(option)

		const { status } = response
		const { data } = response.data

		console.log(data, status)

		return data
	} catch (err) {
		console.log(err)
		return []
	}
}

export default fetchData
