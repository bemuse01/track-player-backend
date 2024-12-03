import _ from 'lodash'
import { PLAYLIST_IDS } from '../../config/config.js'
import DbWork from './dbWork.js'
import LocalWork from './localWork.js'
import StorageWork from './storageWork.js'

class JobWorker {
	constructor({ fastify, storage, youtube }) {
		this.fastify = fastify
		this.youtube = youtube
		this.storage = storage

		this.playlistIds = PLAYLIST_IDS

		this.dbWork = new DbWork()
		this.storageWork = new StorageWork(storage)
		this.localWork = new LocalWork()
	}

	//
	async doWork() {
		const redis = this.fastify.redis
		const isWorking = await redis.get('isWorking')

		if (isWorking === 'true') return

		await redis.set('isWorking', 'true')

		await this.delete()
		await this.update()
		await this.insert()
		await this.end()

		await redis.set('isWorking', 'false')
	}

	// insert and upload tracks, playlist
	async insert() {
		console.log('insert start')
		await Promise.all(this.playlistIds.map((pid) => this.insertWorks(pid)))
		console.log('insert done')
	}
	async insertWorks(pid) {
		try {
			const { youtube, dbWork, storageWork } = this

			// get playlist and tracks info from youtube
			const { playlistName, playlistId, items } = await youtube.getDataFromYoutube(pid)

			// filter tracks already in db
			const tracksInYT = items
			const tracksInDB = await dbWork.getTracksByPlaylistId(pid)
			const tracksToInsert = _.differenceWith(tracksInYT, tracksInDB, (x, y) => x.videoId === y.track_id)

			// stop to insert if no change anything
			if (tracksToInsert.length === 0) {
				console.log('stop insert')
				return
			}

			// insert data to db and upload track thumbnail, audio file
			// playlist
			await dbWork.upsertPlaylist(playlistId, playlistName, items)
			// track
			const tracks = await storageWork.uploadTrackFilesByBatch(playlistId, tracksToInsert)
			await dbWork.upsertTracks(playlistId, tracks)
		} catch (err) {
			console.log(err)
		}
	}

	// update db if tracks not in youtube playlist
	async update() {
		console.log('update start')
		await Promise.all(this.playlistIds.map((pid) => this.updateWorks(pid)))
		console.log('update done')
	}
	async updateWorks(pid) {
		try {
			const { youtube, dbWork, storageWork } = this

			// filter tracks not in youtube playlist
			const { playlistId, playlistName, items } = await youtube.getDataFromYoutube(pid)
			const trackIdsInYT = items.map((item) => item.videoId)
			const trackIdsInDB = await dbWork.getTrackIdsByPlaylistId(pid)
			const trackIdsToDelete = _.difference(trackIdsInDB, trackIdsInYT)

			// update playlist track order and delete tracks from db and storage
			// playlist
			await dbWork.upsertPlaylist(playlistId, playlistName, items)
			// track
			await dbWork.deleteTracks(trackIdsToDelete)
			await storageWork.deleteTrackFilesByBatch(trackIdsToDelete)
		} catch (err) {
			console.log(err)
		}
	}

	// delete all tracks in db, storage if playlist deleted in youtube
	async delete() {
		console.log('delete start')
		const currentPlaylistIds = [...this.playlistIds]
		await Promise.all(currentPlaylistIds.map((pid) => this.deleteWorks(pid)))
		console.log('delete done')
	}
	async deleteWorks(pid) {
		try {
			const { youtube, dbWork, storageWork } = this

			//
			const { error } = await youtube.getDataFromYoutube(pid)

			// return if no error
			if (!error) return

			//
			const trackIds = await dbWork.getTrackIdsByPlaylistId(pid)

			// delete playlist and tracks if playlist not found or deleted in youtube
			// playlist
			await dbWork.deletePlaylist(pid)
			// track
			await dbWork.deleteTracksByPlaylistId(pid)
			await storageWork.deleteTrackFilesByBatch(trackIds)

			// filter playlist ids if delete work done
			this.playlistIds = this.playlistIds.filter((id) => id !== pid)
			console.log(this.playlistIds)
		} catch (err) {
			console.log(err)
		}
	}

	// when all works end
	async end() {
		console.log('end start')
		await Promise.all(this.playlistIds.map((pid) => this.endWorks(pid)))
		console.log('end done')
	}
	async endWorks() {
		const { localWork } = this

		// delete playlist dirs by deleting audio, images dir
		await localWork.deleteAssets()
	}

	dispose() {}
}

export default JobWorker
