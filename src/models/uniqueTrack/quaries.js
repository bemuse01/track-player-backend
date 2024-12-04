import mongoose from 'mongoose'
import { UniqueTrack } from './model'

const upsertUTracks = async (pid, uTracks) => {
	// const filter = { _id: { $in: trackIds } }
	// const update = { $addToSet: { playlists: pid } }
	// const option = { upsert: true }

	const queries = uTracks.map((uTrack) => ({
		updateOne: {
			filter: { _id: uTrack.track_id },
			update: {
				$addToSet: { playlists: pid },
				$setOnInsert: {
					_id: uTrack.track_id,
					playlists: [pid],
				},
			},
			upsert: true,
		},
	}))

	await UniqueTrack.bulkWrite(queries)
}

const getUtrackIdsByPlaylistId = async (pid) => {
	const query = { playlists: pid }
	const uniqueTrackIds = await UniqueTrack.find(query, 'track_id').lean()

	return uniqueTrackIds
}

const removeIdFromUTrackPlaylists = async (pid, ids) => {
	const query = { _id: { $in: ids } }
	const update = { $pull: { playlists: pid } }

	await UniqueTrack.updateMany(query, update)
}

const deleteUTracksIfNoPlaylists = async () => {
	const query = { playlists: { $size: 0 } }

	const uTrackIdsToDelete = await UniqueTrack.find(query, '_id').lean()

	await UniqueTrack.deleteMany(query)

	return uTrackIdsToDelete
}

const deleteTransactionUtracks = async (pid, uTrackIds) => {
	const session = await mongoose.startSession()

	try {
		session.startTransaction()

		let ids = uTrackIds
		if (!ids) ids = await getUtrackIdsByPlaylistId(pid)

		if (ids.length === 0) {
			session.abortTransaction()
			session.endSession()
			console.log(`no documents have playlist id: ${pid}`)
			return []
		}

		await removeIdFromUTrackPlaylists(pid, ids)

		// const deletedIds = await deleteUTracksIfNoPlaylists()

		session.commitTransaction()
	} catch (err) {
		console.log(err)
		session.abortTransaction()
	} finally {
		session.endSession()
	}
}

export { upsertUTracks, deleteUTracksIfNoPlaylists, deleteTransactionUtracks }
