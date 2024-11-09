import mongoose from 'mongoose'

const playlistSchema = new mongoose.Schema({
    _id: {type: String, required: true, trim: true},
    playlist_name: {type: String, required: true, trime: true},
    track_order: {type: Array, default: []}
})
playlistSchema.set('timestamps', {createdAt: 'created_at', updatedAt: 'updated_at'})

const Playlist = new mongoose.model('Playlist', playlistSchema)

export default Playlist