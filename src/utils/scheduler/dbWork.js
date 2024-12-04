import { deletePlaylist, insertOrUpdatePlaylist } from '../../models/playlist/index.js'
import {
	deleteTracks,
	deleteTracksByPlaylistId,
	getAllTracksByPlaylistId,
	insertOrUpdateTracks,
} from '../../models/track/index.js'
import { upsertUTracks, deleteTransactionUTracks, deleteUTracksIfNoPlaylists } from '../../models/uniqueTrack/index.js'

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

	// unique track
	async deleteUTracksIfNoPlaylists() {
		const uTrackIds = await deleteUTracksIfNoPlaylists()
		return uTrackIds
	}
	async upsertUTracks(playlistId, utracks) {
		await upsertUTracks(playlistId, utracks)
	}
	async deleteTransactionUTracks(playlistId, uTrackIds) {
		const deletedUtrackIds = await deleteTransactionUTracks(playlistId, uTrackIds)
		return deletedUtrackIds
	}
}

export default DbWork
