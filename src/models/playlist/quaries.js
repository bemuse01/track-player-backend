import { Playlist } from './index.js'
import mongoose from 'mongoose'
import { DATA_LOAD_LIMIT } from '../../config/config.js'

const getPlaylistCount = async () => {
	try {
		const count = await Playlist.countDocuments()

		return count
	} catch (err) {
		console.log(err)
	}
}

const getAllPlaylists = async () => {
	try {
		const playlists = await Playlist.find()

		return playlists
	} catch (err) {
		console.log(err)
	}
}

const getAllPlaylistIds = async () => {
	try {
		const playlistIds = await Playlist.find({}, 'playlist_id').lean()

		return playlistIds
	} catch (err) {
		console.log(err)
		return []
	}
}

const getPlaylistsByLimit = async (lastObjectId = null) => {
	try {
		const query = lastObjectId ? { _id: { $gte: mongoose.Types.ObjectId.createFromHexString(lastObjectId) } } : {}
		// const playlists = await Playlist.find(query).sort({ _id: -1 }).limit(DATA_LOAD_LIMIT)
		const playlists = await Playlist.find(query).sort({ _id: 1 }).limit(12)

		// console.log(lastObjectId, playlists)

		return playlists
	} catch (err) {
		console.log(err)
	}
}

const insertOrUpdatePlaylist = async (playlistId, playlist) => {
	try {
		const query = { playlist_id: playlistId }
		const option = { upsert: true }

		await Playlist.findOneAndUpdate(query, playlist, option)
	} catch (err) {
		console.log(err)
	}
}

const deletePlaylist = async (playlistId) => {
	try {
		const query = { playlist_id: playlistId }

		await Playlist.deleteOne(query)
	} catch (err) {
		console.log(err)
	}
}

const findPlaylist = async (playlistId) => {
	try {
		const query = { playlist_id: playlistId }

		const playlist = await Playlist.findOne(query)

		return playlist
	} catch (err) {
		console.log(err)
	}
}

export {
	insertOrUpdatePlaylist,
	getPlaylistCount,
	getAllPlaylists,
	getAllPlaylistIds,
	getPlaylistsByLimit,
	deletePlaylist,
	findPlaylist,
}
