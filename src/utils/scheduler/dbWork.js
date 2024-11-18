import { insertOrUpdateTracks, deleteTracks } from '../../controllers/trackControllers.js'
import { insertOrUpdatePlaylist } from '../../controllers/playlistController'


class DbWork{
    // track
    async upsertTracks(playlistId, tracks){
        await insertOrUpdateTracks(playlistId, tracks)
    }
    async deleteTracks(trackIds){
        await deleteTracks(trackIds)
    }


    // playlist
    async upsertPlaylist(playlistId, playlistName, items){
        try{

            const track_order = items.map(item => item.videoId)
            const playlist = {_id: playlistId, playlistName, track_order}
            await insertOrUpdatePlaylist(playlistId, playlist)

        }catch(err){

            console.log(err)

        }
    }
}


export default DbWork