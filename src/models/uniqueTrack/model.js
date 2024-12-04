import mongoose from 'mongoose'

const uniqueTrackSchema = new mongoose.Schema({
	_id: { type: String, required: true, trim: true },
	playlists: { type: Array, default: [] },
})
uniqueTrackSchema.set('timestamps', {
	createdAt: 'created_at',
	updatedAt: 'updated_at',
})

const UniqueTrack = new mongoose.model('uniqueTrack', uniqueTrackSchema)

export { UniqueTrack }
