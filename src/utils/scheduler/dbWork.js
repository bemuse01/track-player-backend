import { insertOrUpdateTracks, deleteTracks, deleteTracksByPlaylistId } from '../../controllers/trackControllers.js'
import { insertOrUpdatePlaylist, deletePlaylist } from '../../controllers/playlistController.js'


class DbWork{
    // track
    async upsertTracks(playlistId, tracks){
        await insertOrUpdateTracks(playlistId, tracks)
    }
    async deleteTracks(trackIds){
        await deleteTracks(trackIds)
    }
    async deleteTracksByPlaylistId(playlistId){
        await deleteTracksByPlaylistId(playlistId)
    }


    // playlist
    async upsertPlaylist(playlistId, playlistName, items){
        try{

            const track_order = items.map(item => item.videoId)
            const playlist = {_id: playlistId, playlist_name: playlistName, track_order}
            await insertOrUpdatePlaylist(playlistId, playlist)

        }catch(err){

            console.log(err)

        }
    }
    async deletePlaylist(playlistId){
        await deletePlaylist(playlistId)
    }
}


export default DbWork