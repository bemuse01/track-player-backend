import { mkdir } from 'node:fs/promises'
import axios from 'axios'
import _ from 'lodash'
import sharp from 'sharp'
import { IMAGE_FORMAT } from '../../config/file.js'
import { IMAGE_SAVE_PATH } from '../../config/urls.js'

const toHex = (r, g, b) => {
	return [r, g, b]
		.map((e) => {
			const raw = e.toString(16)
			return raw.length === 1 ? '0' + raw : raw
		})
		.join('')
}

const toStringArray = (pixels, width, height, channels) => {
	const temp = []

	for (let i = 0; i < height; i++) {
		for (let j = 0; j < width; j++) {
			const idx = (i * width + j) * channels
			const r = pixels[idx + 0]
			const g = pixels[idx + 1]
			const b = pixels[idx + 2]
			const color = `${r},${g},${b}`

			temp.push(color)
		}
	}

	return temp
}

const processImage = async ({ videoId, url, playlistId }) => {
	try {
		const response = await axios({ url, responseType: 'arraybuffer' })
		const input = response.data
		const image = sharp(input)
		const { width, height, channels } = await image.metadata()

		// resize
		const left = ~~((width - height) / 2)
		const top = 0
		const croppedImage = image.extract({ left, top, width: height, height })

		// main color
		const size = 100
		const { data } = await sharp(input)
			.extract({ left, top, width: height, height })
			.resize({ width: size, height: size, fit: sharp.fit.fill })
			.raw()
			.toBuffer({ resolveWithObject: true })

		const pixels = new Uint8ClampedArray(data.buffer)
		const pixelArray = toStringArray(pixels, size, size, channels)
		const counts = _.toPairs(_.countBy(pixelArray))
		const maxPixel = _.maxBy(counts, (e) => e[1])[0]
		const [r, g, b] = maxPixel.split(',').map((e) => +e)
		const hex = toHex(r, g, b)

		// save
		const playlistPath = IMAGE_SAVE_PATH + playlistId + '/'
		await mkdir(playlistPath, { recursive: true })

		const savePath = playlistPath + videoId + '.' + IMAGE_FORMAT
		await croppedImage.toFile(savePath)

		return { main_color: hex, savePath }
	} catch (err) {
		console.log(err)
	}
}

export { processImage }
