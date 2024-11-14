import Playlist from '../models/playlist.js'

const getAllPlaylists = async () => {
    try{

        const playlists = await Playlist.find()

        return playlists

    }catch(err){

        console.log(err)

    }
}

const insertOrFindPlaylist = async (playlistId, playlist) => {
    try{

        const query = {_id: playlistId}
        const option = {upsert: true}

        await Playlist.findOneAndUpdate(query, playlist, option)

    }catch(err){

        console.log(err)

    }
}


export {insertOrFindPlaylist, getAllPlaylists}