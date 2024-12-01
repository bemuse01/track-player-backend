import mongoose from 'mongoose'
import { getAllTracksByPlaylistId, insertOrUpdateTracks, deleteTracks, deleteTracksByPlaylistId } from './quaries.js'

const trackSchema = new mongoose.Schema({
    track_id: { type: String, required: true, trim: true },
    artist: { type: String, default: '', trim: true },
    title: { type: String, default: '', trim: true },
    audio_url: { type: String, required: true, trim: true },
    thumbnail_url: { type: String, required: true, trim: true },
    main_color: { type: String, default: 'ffffff', trim: true },
    playlist: { type: String, required: true, ref: 'Playlist' },
})
trackSchema.set('timestamps', {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
})

const Track = new mongoose.model('Track', trackSchema)

export { Track, getAllTracksByPlaylistId, insertOrUpdateTracks, deleteTracks, deleteTracksByPlaylistId }
