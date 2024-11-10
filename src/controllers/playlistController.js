import Playlist from '../models/playlist.js'


const insertOrFindPlaylist = async (playlistId, playlist) => {
    try{

        const query = {_id: playlistId}
        const option = {upsert: true}

        await Playlist.findOneAndUpdate(query, playlist, option)

    }catch(err){

        console.log(err)
        throw new Error(err)

    }
}


export {insertOrFindPlaylist}