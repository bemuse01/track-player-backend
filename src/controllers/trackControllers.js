import Track from '../models/track.js'


const getAllTracksByPlaylistId = async (playlistId) => {

}

const insertTracks = async (tracks = []) => {
    try{

        await Track.updateMany(tracks, {upsert: true})
        console.log('success to insert')

    }catch(err){

        console.log(err)
        throw new Error(err.message)

    }
}

const deleteTracks = async (tracks = []) => {

}


export {getAllTracksByPlaylistId, insertTracks}