import mongoose from 'mongoose'
import Track from '../models/track.js'

const getAllTracks = async () => {

}
const insertTrack = async ({id, artist = '', title = '', media_file = '', thumbnail = '', main_color = 'ffffff'}) => {
    const tracks = [
        {id, artist, title, media_file, thumbnail, main_color}
    ]

    try{
        await Track.insertMany(tracks)
        console.log('success')
    }catch(err){
        console.log('failed', err)
    }
}


export {getAllTracks, insertTrack}