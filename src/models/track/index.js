import { Track } from './model.js'
import {
	deleteTracks,
	deleteTracksByPlaylistId,
	getTracksByLimit,
	getAllTracksByPlaylistId,
	insertOrUpdateTracks,
	getTrackById,
} from './quaries.js'

export {
	Track,
	getAllTracksByPlaylistId,
	getTracksByLimit,
	getTrackById,
	insertOrUpdateTracks,
	deleteTracks,
	deleteTracksByPlaylistId,
}
