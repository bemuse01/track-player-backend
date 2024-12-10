import pLimit from 'p-limit'
import { PROMISE_BATCH_SIZE } from '../../config/config.js'
import { AUDIO_FLAG, AUDIO_FORMAT, IMAGE_FLAG, IMAGE_FORMAT } from '../../config/file.js'
import { processAudio } from '../api/audio.js'
import { processImage } from '../api/image.js'
import { deleteFile } from '../api/local.js'
import { THUMBNAIL_CONTAINER_NAME, AUDIO_CONTAINER_NAME } from '../../config/const.js'

class StorageWork {
	constructor(storage) {
		this.storage = storage
		this.batchSize = PROMISE_BATCH_SIZE
		this.limit = pLimit(PROMISE_BATCH_SIZE)
	}

	// track

	// upload
	async uploadTrackFilesByBatch(playlistId, items) {
		// process promises by batch
		const { limit } = this

		const limits = items.map((item) => limit(() => this.uploadTrackFiles(item, playlistId)))

		const tracks = await Promise.all(limits)

		return tracks
	}
	async uploadTrackFiles(item, playlistId) {
		const { storage } = this
		const { videoId, thumbnailUrl, videoUrl, artist, title } = item

		// create and save image, audio file on local
		const { main_color, savePath: localImagePath } = await processImage({ videoId, url: thumbnailUrl, playlistId })
		const localAudioPath = await processAudio({ videoId, url: videoUrl, playlistId })
		console.log(videoId, localAudioPath)

		// upload blob to storage
		const blobs = [
			{
				localPath: localImagePath,
				containerName: THUMBNAIL_CONTAINER_NAME,
				// blobName: localImagePath.split('/').pop(),
				blobName: videoId + '.' + IMAGE_FORMAT,
			},
			{
				localPath: localAudioPath,
				containerName: AUDIO_CONTAINER_NAME,
				// blobName: localAudioPath.split('/').pop(),
				blobName: videoId + '.' + AUDIO_FORMAT,
			},
		]
		// const [thumbnail_url, audio_url] = await Promise.all(blobs.map((blob) => storage.uploadBlob(blob)))
		await Promise.all(blobs.map((blob) => storage.uploadBlob(blob)))

		const thumbnail = { type: IMAGE_FLAG, name: 'track thumbnail' }
		const audio = { type: AUDIO_FLAG, name: 'track audio' }

		// delete local file
		await Promise.all(blobs.map(({ localPath }) => deleteFile(localPath)))

		return {
			track_id: videoId,
			artist,
			title,
			main_color,
			thumbnail,
			audio,
		}
	}

	// delete
	async deleteTrackFilesByBatch(trackIds) {
		// process promises by batch
		const { limit } = this

		const limits = trackIds.map(({ _id }) => limit(() => this.deleteTrackFiles(_id)))

		// wait all batch
		await Promise.all(limits)
	}
	async deleteTrackFiles(trackId) {
		const { storage } = this

		const blobs = [
			{
				containerName: THUMBNAIL_CONTAINER_NAME,
				blobName: trackId + '.' + IMAGE_FORMAT,
			},
			{
				containerName: AUDIO_CONTAINER_NAME,
				blobName: trackId + '.' + AUDIO_FORMAT,
			},
		]

		await Promise.all(blobs.map((blob) => storage.deleteBlob(blob)))
	}
}

export default StorageWork
