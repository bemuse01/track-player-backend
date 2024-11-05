import mongoose from 'mongoose'
import Track from '../models/track.js'

const getAllTracks = async () => {

}
const insertTracks = async (tracks = []) => {
    try{
        await Track.updateMany(tracks, {upsert: true})
        console.log('success to insert')
    }catch(err){
        throw new Error('failed to insert: ' + err.message)
    }
}


export {getAllTracks, insertTracks}