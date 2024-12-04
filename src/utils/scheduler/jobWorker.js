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

			// 삽입 작업
			// 플레이리스트
			await dbWork.upsertPlaylist(playlistId, playlistName, items)
			// 트랙
			const tracks = await storageWork.uploadTrackFilesByBatch(playlistId, tracksToInsert)
			await dbWork.upsertTracks(playlistId, tracks)
			// 유니크 트랙
			await dbWork.upsertUTracks(playlistId, tracks)
		} catch (err) {
			console.log(err)
		}
	}

	// 유튜브의 플레이리스트의 내용이 업데이트 되면 실행되는 작업 메소드
	async update() {
		console.log('update start')
		await Promise.all(this.playlistIds.map((pid) => this.updateWorks(pid)))
		console.log('update done')
	}
	async updateWorks(pid) {
		try {
			const { youtube, dbWork, storageWork } = this

			// 유튜브 플레이리스트에 있는 하나 혹은 여럿의 트랙이 이동, 삭제 됐을 경우,
			// DB에 있는 트랙과 비교해서 필터링
			const { playlistId, playlistName, items } = await youtube.getDataFromYoutube(pid)
			const trackIdsInYT = items.map((item) => item.videoId)
			const trackIdsInDB = await dbWork.getTrackIdsByPlaylistId(pid)
			const trackIdsToDelete = _.difference(trackIdsInDB, trackIdsInYT)

			// 업데이트 작업
			// 필터링된 트랙 아이디로 유니크 트랙 삭제 트랜잭션 작업 후 삭제된 아이디 반환
			await dbWork.deleteTransactionUTracks(pid, trackIdsToDelete)

			// 필터링된 트랙으로 플레이리스트 DB 정보를 변경, 트랙 삭제
			await dbWork.upsertPlaylist(playlistId, playlistName, items)
			await dbWork.deleteTracks(trackIdsToDelete)
		} catch (err) {
			console.log(err)
		}
	}

	// 처음 실행되는 삭제 작업 메소드
	// 해당 플레이리스트가 유튜브에 더 이상 존재하지 않으면 DB와 storage에서 삭제
	async delete() {
		console.log('delete start')
		const currentPlaylistIds = [...this.playlistIds]
		await Promise.all(currentPlaylistIds.map((pid) => this.deleteWorks(pid)))
		console.log('delete done')
	}
	async deleteWorks(pid) {
		try {
			const { youtube, dbWork, storageWork } = this

			// 작업 전 에러 처리
			// 유튜브에 해당 플레이리스트 존재 유무 판별
			const { error } = await youtube.getPlaylist(pid)

			// 플레이리스트가 유튜브에 없으면 작업 건너뜀
			if (!error) {
				console.log(`Invalid playlist from youtube: ${pid}, skip delete`)
				this.filterPlaylistIds(pid)
				return
			}

			// 삭제 작업
			// 플레이리스트 아이디로 유니크 트랙 삭제 트랜잭션 작업 후 삭제된 아이디 반환
			await dbWork.deleteTransactionUTracks(pid)

			// DB 트랙, 플레이리스트 삭제 작업
			await dbWork.deletePlaylist(pid)
			await dbWork.deleteTracksByPlaylistId(pid)

			// 삭제 작업 완료 후 플레이리스트 배열 필터링
			this.filterPlaylistIds(pid)
		} catch (err) {
			console.log(err)
		}
	}
	filterPlaylistIds(pid) {
		this.playlistIds = this.playlistIds.filter((id) => id !== pid)
	}

	// 모든 작업 메소드 완료 후 실행되는 마무리 작업 메소드
	async end() {
		console.log('end start')
		await Promise.all(this.playlistIds.map((pid) => this.endWorks(pid)))
		console.log('end done')
	}
	async endWorks() {
		const { localWork, storageWork, dbWork } = this

		// 임시 assets 로컬 폴더 삭제
		await localWork.deleteAssets()

		// playlists 필드(array 타입)에 배열 길이가 0인 유니크 트랙일 경우 DB와 storage에서 삭제
		const deletedUtrackIds = await dbWork.deleteUTracksIfNoPlaylists()
		await storageWork.deleteTrackFilesByBatch(deletedUtrackIds)
	}

	dispose() {}
}

export default JobWorker
