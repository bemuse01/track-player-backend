import { PROMISE_BATCH_SIZE } from '../config/config.js'
import { PLAYLIST_IDS } from '../config/urls.js'
import extractFromYoutube from './extractFromYoutube.js'
import processImage from './processImage.js'
import processVideo from './processVideo.js'
import uploadFile from './uploadFile.js'
import deleteLocalFile from './deleteLocalFile.js'
import { insertOrFindPlaylist } from '../controllers/playlistController.js'


class TrackWorker{
    constructor({fastify}){
        this.fastify = fastify
        this.youtube = this.fastify.youtube
        this.blobServiceClient = this.fastify.blobServiceClient

        this.playlistIds = PLAYLIST_IDS
        this.batchSize = PROMISE_BATCH_SIZE
    }



    // insert and upload tracks, playlist
    async insert(){
        const tracks = await Promise.all(this.playlistIds.map(async pid => this.insertPlaylistAndTracks(pid)))
        console.log(tracks)
        console.log('done')
    }
    async insertPlaylistAndTracks(pid){
        try{

            const {youtube} = this
            const {playlist_name, playlist_id, items} = await extractFromYoutube(youtube, pid)

            const playlistObjectId = await this.insertPlaylist(playlist_id, playlist_name, items)
            const tracks = await this.insertTracks(playlistObjectId, items)

            return tracks

        }catch(err){

            console.log(err)

        }
    }
    // playlist
    async insertPlaylist(playlist_id, playlist_name, items){
        try{

            const track_order = items.map(item => item.track_id)
            const playlist = {playlist_id, playlist_name, track_order}
            const {_id} = await insertOrFindPlaylist(playlist_id, playlist)
            return _id

        }catch(err){

            console.log(err)
            throw new Error(err.message)

        }
    }
    // track
    async insertTracks(playlistObjectId, items){
        try{
    
            const {batchSize} = this
            const promiseArray = []
    
            for(let i = 0; i < items.length; i += batchSize){
                const batch = items.slice(i, i + batchSize).map(item => this.uploadTrackAndGetTrackInfo(item))
                promiseArray.push(await Promise.all(batch))
                console.log('batch length: ', promiseArray.length)
            }
    
            const tracks = (await Promise.all(promiseArray)).flat().map(item => ({...item, playlist: playlistObjectId}))

            return tracks
    
        }catch(err){

            console.log(err)
            throw new Error(err.message)

        }
    }
    async uploadTrackAndGetTrackInfo(item){
        try{

            const {blobServiceClient} = this
            const {track_id, thumbnailUrl, videoUrl, artist, title} = item
    

            // create and save image, audio file on local
            const {main_color, savePath: localImagePath} = await processImage(track_id, thumbnailUrl)
            const localAudioPath = await processVideo(track_id, videoUrl)
    
    
            // upload blob to storage
            const blobs = [
                {
                    localPath: localImagePath,
                    containerName: process.env.THUMBNAIL_CONTAINER_NAME,
                    blobName: localImagePath.split('/').pop()
                },
                {
                    localPath: localAudioPath,
                    containerName: process.env.AUDIO_CONTAINER_NAME,
                    blobName: localAudioPath.split('/').pop()
                }
            ]
            // const [thumbnail_url, audio_url] = await Promise.all(blobs.map(blob => uploadFile(blobServiceClient, blob)))
    
    
            // delete local file
            await deleteLocalFile([localImagePath, localAudioPath])
    
    
            return {track_id, artist, title, main_color, thumbnail_url: '', audio_url: ''}
    
        }catch(err){
    
            console.log(err)
            throw new Error(err.message)
    
        }
    }



    dispose(){

    }
}


export default TrackWorker