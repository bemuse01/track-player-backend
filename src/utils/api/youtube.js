import { google } from 'googleapis'
import { ARTIST_REGEX, PROMISE_BATCH_SIZE, MAX_VIDEO_TIME } from '../../config/config.js'
import { YOUTUBE_BASE_URL } from '../../config/urls.js'
import { replaceText, calculateDuration } from './helper.js'
import pLimit from 'p-limit'
import _ from 'lodash'
import 'dotenv/config'

class Youtube {
	constructor() {
		this.youtube = google.youtube({
			version: 'v3',
			auth: process.env.YOUTUBE_API_KEY,
		})
		this.maxChunk = 50
		this.limit = pLimit(PROMISE_BATCH_SIZE)
	}

	async getDataFromYoutube(playlistId) {
		try {
			const { playlist_name, playlist_id, error } = await this.getPlaylist(playlistId)

			if (error) return { error }

			const items = await this.getPlaylistItems(playlistId)
			const filteredItems = await this.filterItems(items)
			// console.log(filteredItems)

			return {
				playlistName: playlist_name,
				playlistId: playlist_id,
				items: filteredItems,
			}
		} catch (err) {
			console.log(err)
		}
	}

	async getPlaylist(playlistId) {
		try {
			const { youtube } = this

			const response = await youtube.playlists.list({
				part: 'snippet',
				id: playlistId,
			})

			const items = response.data.items

			if (items.length === 0) return { error: 'no playlist' }

			const item = items[0]
			const playlist_id = item.id
			const { title } = item.snippet

			return { playlist_name: title, playlist_id }
		} catch (err) {
			console.log(err)
		}
	}

	async getPlaylistItems(playlistId) {
		try {
			const { youtube } = this

			let nextPageToken = ''
			const listItems = []

			do {
				const response = await youtube.playlistItems.list({
					part: 'snippet',
					playlistId,
					maxResults: 50,
					pageToken: nextPageToken,
				})

				const items = response.data.items
					.map((item) => {
						const { videoOwnerChannelTitle, title, thumbnails, resourceId } = item.snippet

						if (!videoOwnerChannelTitle) return {}

						const artist = replaceText(ARTIST_REGEX, videoOwnerChannelTitle, ' ').trim()
						const maxSizeThumbnail = _.sortBy(Object.values(thumbnails), ['width']).pop()
						const thumbnailUrl = maxSizeThumbnail.url
						const videoId = resourceId.videoId
						const videoUrl = YOUTUBE_BASE_URL + videoId

						// console.log(maxSizeThumbnail)
						// console.log(videoOwnerChannelTitle, ' -> ', artist)

						return { title, artist, thumbnailUrl, videoId, videoUrl }
					})
					.filter((item) => item.title !== undefined)

				listItems.push(...items)

				nextPageToken = response.data.nextPageToken
			} while (nextPageToken)

			return listItems
		} catch (err) {
			console.log(err)
		}
	}

	async filterItems(items) {
		const { limit, maxChunk } = this

		const chunkCount = Math.ceil(items.length / maxChunk)

		const videoIds = items.map((item) => item.videoId)
		const idChunks = Array.from({ length: chunkCount }, (_, i) =>
			videoIds.slice(i * maxChunk, (i + 1) * maxChunk).join(',')
		)

		const limits = idChunks.map((idChunk) => limit(() => this.getFilteredIds(idChunk)))

		const result = (await Promise.all(limits)).flat()

		return items.filter((item) => result.includes(item.videoId))
	}

	async getFilteredIds(idChunk) {
		const { youtube } = this

		const response = await youtube.videos.list({
			part: 'contentDetails',
			id: idChunk,
		})
		const items = response.data.items

		const filteredItems = items
			.filter((video) => calculateDuration(video.contentDetails.duration) <= MAX_VIDEO_TIME)
			.map((video) => video.id)

		// console.log(filteredItems)

		return filteredItems
	}
}

// const playlistId = 'PL3On5o_P3DzPfVnnXZMpO_-7aLVpL7KqI'
// new Youtube().getDataFromYoutube(playlistId)
export default Youtube
