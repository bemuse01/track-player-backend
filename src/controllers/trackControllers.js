import mongoose from 'mongoose'
import Track from '../models/track.js'


const getAllTracksByPlaylistId = async (playlistId) => {
    try{

        const query = {playlist: playlistId}
        const tracks = await Track.find(query)

        return tracks

    }catch(err){

        console.log(err)

    }
}

const insertOrUpdateTracks = async (tracks = []) => {
    try{

        const queries = tracks.map(track => ({
            updateOne: {
                filter: {_id: track._id},
                update: {$set: {...track}},
                upsert: true
            }
        }))

        await Track.bulkWrite(queries)
        console.log('success to insert')

    }catch(err){

        console.error(err.message, err)

    }
}

const deleteTracks = async (trackIds = []) => {
    try{
        const query = {_id: {$in: trackIds}}
        await Track.deleteMany(query)
    }catch(err){

        console.error(err.message, err)

    }
}


export {getAllTracksByPlaylistId, insertOrUpdateTracks, deleteTracks}