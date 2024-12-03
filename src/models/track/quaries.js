import { Track } from './index.js'

const getAllTracksByPlaylistId = async (playlistId) => {
	try {
		const query = { playlist: playlistId }
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

export { getAllTracksByPlaylistId, insertOrUpdateTracks, deleteTracks, deleteTracksByPlaylistId, getTrackById }
