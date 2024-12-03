import { deletePlaylist, insertOrUpdatePlaylist } from '../../models/playlist/index.js'
import {
	deleteTracks,
	deleteTracksByPlaylistId,
	getAllTracksByPlaylistId,
	insertOrUpdateTracks,
} from '../../models/track/index.js'

class DbWork {
	// track
	async getTracksByPlaylistId(playlistId) {
		const tracks = await getAllTracksByPlaylistId(playlistId)

		return tracks
	}
	async getTrackIdsByPlaylistId(playlistId) {
		const tracks = await getAllTracksByPlaylistId(playlistId)
		const trackIds = tracks.map((track) => track.track_id)

		return trackIds
	}
	async upsertTracks(playlistId, tracks) {
		await insertOrUpdateTracks(playlistId, tracks)
	}
	async deleteTracks(trackIds) {
		await deleteTracks(trackIds)
	}
	async deleteTracksByPlaylistId(playlistId) {
		await deleteTracksByPlaylistId(playlistId)
	}

	// playlist
	async upsertPlaylist(playlistId, playlistName, items) {
		const track_order = items.map((item) => item.videoId)
		const playlist = {
			_id: playlistId,
			playlist_name: playlistName,
			track_order,
		}
		await insertOrUpdatePlaylist(playlistId, playlist)
	}
	async deletePlaylist(playlistId) {
		await deletePlaylist(playlistId)
	}
}

export default DbWork
