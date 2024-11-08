import Playlist from '../models/playlist.js'


const insertOrFindPlaylist = async (playlistId, playlist) => {
    try{

        const query = {playlist_id: playlistId}
        const option = {upsert: true, new: true}

        const result = await Playlist.findOneAndUpdate(query, playlist, option)

        console.log(result)

        return result

    }catch(err){

        console.log(err)
        throw new Error(err)

    }
}


export {insertOrFindPlaylist}