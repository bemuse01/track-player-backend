import _ from 'lodash'
import fetchData from '../api/fetchData.js'
import DbWork from './dbWork.js'
import LocalWork from './localWork.js'
import StorageWork from './storageWork.js'
import pLimit from 'p-limit'
import { PROMISE_BATCH_SIZE } from '../../config/config.js'

class JobWorker {
	constructor({ fastify, storage, youtube }) {
		this.fastify = fastify
		this.youtube = youtube
		this.storage = storage

		this.playlistIds = []

		this.dbWork = new DbWork()
		this.storageWork = new StorageWork(storage)
		this.localWork = new LocalWork()

		this.limit = pLimit(PROMISE_BATCH_SIZE)
	}

	//
	async doWork() {
		const redis = this.fastify.redis
		const isWorking = await redis.get('isWorking')

		if (isWorking === 'true') return

		await redis.set('isWorking', 'true')

		await this.loadPlaylistData()
		await this.delete()
		await this.update()
		await this.insert()
		await this.end()

		await redis.set('isWorking', 'false')
	}

	// 플레이리스트 데이터 파일 로드
	async loadPlaylistData() {
		const data = await fetchData()
		this.playlistIds = data.map((item) => item.id)
	}

	// 삽입 작업
	async insert() {
		console.log('insert start')

		const { limit } = this

		const limits = this.playlistIds.map((pid) => limit(() => this.insertWorks(pid)))
		await Promise.all(limits)

		console.log('insert done')
	}
	async insertWorks(pid) {
		try {
			const { youtube, dbWork, storageWork } = this

			// 유튜브 API로 부터 플레이리스트와 트랙 정보를 로드
			const { playlistName, playlistId, items, error } = await youtube.getDataFromYoutube(pid)

			// 에러 처리
			if (error) {
				console.log(`invalid playlist from youtube: ${pid}, skip insert`)
				return
			}

			// DB의 트랙과 유튜브 플레이리스트의 트랙과 비교해서 삽입할 트랙을 필터링
			const tracksInYT = items
			const tracksInDB = await dbWork.getTracksByPlaylistId(pid)
			const tracksToInsert = _.differenceWith(tracksInYT, tracksInDB, (x, y) => x.videoId === y.track_id)

			// 필터링된 트랙에 아무것도 없으면(변한게 없으면) 삽입 작업을 건너뜀
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

		const { limit } = this

		const limits = this.playlistIds.map((pid) => limit(() => this.updateWorks(pid)))
		await Promise.all(limits)

		console.log('update done')
	}
	async updateWorks(pid) {
		try {
			const { youtube, dbWork } = this

			// 유튜브 플레이리스트에 있는 하나 혹은 여럿의 트랙이 이동, 삭제 됐을 경우,
			// DB에 있는 트랙과 비교해서 필터링
			const { playlistId, playlistName, items, error } = await youtube.getDataFromYoutube(pid)

			// 에러 처리
			if (error) {
				console.log(`invalid playlist from youtube: ${pid}, skip update`)
				return
			}

			const trackIdsInYT = items.map((item) => item.videoId)
			const trackIdsInDB = await dbWork.getTrackIdsByPlaylistId(pid)
			const trackIdsToDelete = _.difference(trackIdsInDB, trackIdsInYT)

			// 업데이트 작업
			// 필터링된 트랙 아이디로 유니크 트랙 삭제 트랜잭션 작업 후 삭제된 아이디 반환
			await dbWork.deleteTransactionUTracks(pid, trackIdsToDelete)

			// 필터링된 트랙으로 트랙 DB 삭제, 플레이리스트 트랙 순서 업데이트
			await dbWork.upsertPlaylist(playlistId, playlistName, items)
			await dbWork.deleteTracks(trackIdsToDelete)
		} catch (err) {
			console.log(err)
		}
	}

	// 처음 실행되는 삭제 작업 메소드
	// 해당 플레이리스트가 유튜브에 더 이상 존재하지 않으면 DB와 storage에서 삭제
	// DB의 플레이리스트와 JSON 데이터의 플레이리스트가 일치하지 않을수도 있으므로 DB에 있는 플레이리스트를 기준으로 유무 검사
	async delete() {
		console.log('delete start')

		const { limit } = this

		const playlistIds = await this.getPlaylistIds()
		console.log('playlists in db: ', playlistIds)

		const currentPlaylistIds = playlistIds.length === 0 ? [...this.playlistIds] : playlistIds

		const limits = currentPlaylistIds.map((pid) => limit(() => this.deleteWorks(pid)))
		await Promise.all(limits)

		console.log('delete done')
	}
	async deleteWorks(pid) {
		try {
			const { youtube, dbWork } = this

			// 작업 전 에러 처리
			// 유튜브에 해당 플레이리스트 존재 유무 판별
			const { error } = await youtube.getPlaylist(pid)

			// 플레이리스트가 유튜브에 있으면 작업 건너뜀
			if (!error) {
				console.log(`valid playlist from youtube: ${pid}, skip delete`)
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
	async getPlaylistIds() {
		const { dbWork } = this
		const result = await dbWork.getAllPlaylistIds()
		return result.map((item) => item.playlist_id)
	}
	filterPlaylistIds(pid) {
		this.playlistIds = this.playlistIds.filter((id) => id !== pid)
	}

	// 모든 작업 메소드 완료 후 실행되는 마무리 작업 메소드
	async end() {
		console.log('end start')
		await this.endWorks()
		console.log('end done')
	}
	async endWorks() {
		const { localWork, storageWork, dbWork } = this

		// 임시 assets 로컬 폴더 삭제
		await localWork.deleteAssets()

		// playlists 필드(array 타입)에 배열 길이가 0인 유니크 트랙일 경우 DB와 storage에서 삭제
		const deletedUtrackIds = await dbWork.deleteUTracksIfNoPlaylists()
		console.log(deletedUtrackIds)
		await storageWork.deleteTrackFilesByBatch(deletedUtrackIds)
	}

	dispose() {}
}

export default JobWorker
