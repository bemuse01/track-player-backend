import mongoose from 'mongoose'

const trackSchema = new mongoose.Schema({
    id: {type: String, required: true, unique: true, trim: true},
    artist: {type: String, default: '', trim: true},
    title: {type: String, default: '', trim: true},
    media_file: {type: String, required: true, trim: true},
    thumbnail: {type: String, required: true, trim: true},
    main_color: {type: String, default: 'ffffff', trim: true},
    playlist_name: {type: String, required: true, trime: true}
})
trackSchema.set('timestamps', {createdAt: 'created_at', updatedAt: 'updated_at'})

const Track = new mongoose.model('Track', trackSchema)

export default Track