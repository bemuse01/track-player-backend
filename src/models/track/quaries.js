import { DATA_LOAD_LIMIT } from '../../config/config.js'
import { Track } from './index.js'
import { findPlaylist } from '../playlist/index.js'

const getAllTracksByPlaylistId = async (playlistId) => {
	try {
		const query = { playlist: playlistId }
		const tracks = await Track.find(query)

		return tracks
	} catch (err) {
		console.log(err)
	}
}

const getTracksByLimit = async (playlistId, lastTrackId = null) => {
	try {
		const { track_order } = await findPlaylist(playlistId)
		const trackIdx = track_order.findIndex((trackId) => trackId === lastTrackId)
		const startIdx = trackIdx === -1 ? 0 : trackIdx
		const endIdx = startIdx + DATA_LOAD_LIMIT
		const trackIds = track_order.slice(startIdx, endIdx)

		const query = { track_id: { $in: trackIds }, playlist: playlistId }
		const tracks = await Track.find(query)

		return tracks
	} catch (err) {
		console.log(err)
	}
}

const insertOrUpdateTracks = async (playlist_id, tracks = []) => {
	try {
		const queries = tracks.map((track) => ({
			updateOne: {
				filter: { track_id: track.track_id, playlist: playlist_id },
				update: { $set: { ...track } },
				upsert: true,
			},
		}))

		await Track.bulkWrite(queries)
		console.log('success to insert')
	} catch (err) {
		console.error(err.message, err)
	}
}

const deleteTracks = async (trackIds = []) => {
	try {
		const query = { track_id: { $in: trackIds } }
		await Track.deleteMany(query)
	} catch (err) {
		console.error(err.message, err)
	}
}

const deleteTracksByPlaylistId = async (playlistId) => {
	try {
		const qeury = { playlist: playlistId }
		await Track.deleteMany(qeury)
	} catch (err) {
		console.log(err)
	}
}

const getTrackById = async (trackId) => {
	try {
		const query = { track_id: trackId }
		const track = await Track.findOne(query)

		return track
	} catch (err) {
		console.log(err)
	}
}

export {
	getAllTracksByPlaylistId,
	getTracksByLimit,
	insertOrUpdateTracks,
	deleteTracks,
	deleteTracksByPlaylistId,
	getTrackById,
}
