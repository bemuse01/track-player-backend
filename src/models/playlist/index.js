import mongoose from 'mongoose'
import { insertOrUpdatePlaylist, getAllPlaylists, deletePlaylist, findPlaylist } from './quaries.js'

const playlistSchema = new mongoose.Schema({
    _id: { type: String, required: true, trim: true },
    playlist_name: { type: String, required: true, trime: true },
    track_order: { type: Array, default: [] },
})
playlistSchema.set('timestamps', {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
})

const Playlist = new mongoose.model('Playlist', playlistSchema)

export { Playlist, insertOrUpdatePlaylist, getAllPlaylists, deletePlaylist, findPlaylist }