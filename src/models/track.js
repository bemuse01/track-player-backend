import mongoose from 'mongoose'

const trackSchema = new mongoose.Schema({
    id: {type: String, required: true},
    artist: {type: String, default: ''},
    title: {type: String, default: ''},
    media_file: {type: String, required: true},
    thumbnail: {type: String, required: true},
    main_color: {type: String, default: 'ffffff'}
})
const Track = new mongoose.model('Track', trackSchema)

export default Track