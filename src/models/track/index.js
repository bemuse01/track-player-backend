import { Track } from './model.js'
import {
	deleteTracks,
	deleteTracksByPlaylistId,
	getAllTracksByPlaylistId,
	insertOrUpdateTracks,
	getTrackById,
} from './quaries.js'

export { Track, getAllTracksByPlaylistId, getTrackById, insertOrUpdateTracks, deleteTracks, deleteTracksByPlaylistId }
