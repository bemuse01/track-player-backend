import { PROMISE_BATCH_SIZE } from '../config/config.js'
import { PLAYLIST_IDS } from '../config/urls.js'
import processImage from './processImage.js'
import processVideo from './processVideo.js'
import deleteLocalFile from './deleteLocalFile.js'
import { insertOrUpdatePlaylist } from '../controllers/playlistController.js'
import { deleteTracks, getAllTracksByPlaylistId, insertOrUpdateTracks } from '../controllers/trackControllers.js'
import _ from 'lodash'
import { AUDIO_FORMAT, IMAGE_FORMAT } from '../config/file.js'


class TrackWorker{
    constructor({fastify, storage, youtube}){
        this.fastify = fastify
        this.youtube = youtube
        this.storage = storage

        this.playlistIds = PLAYLIST_IDS
        this.batchSize = PROMISE_BATCH_SIZE
    }



    // 
    async doWork(){
        await this.delete()
        await this.insert()
    }



    // insert and upload tracks, playlist
    async insert(){
        console.log('insert start')
        await Promise.all(this.playlistIds.map(pid => this.insertWorks(pid)))
        console.log('insert done')
    }
    async insertWorks(pid){
        try{


            // get playlist and tracks info from youtube
            const {youtube} = this
            const {playlistName, playlistId, items} = await youtube.getDataFromYoutube(pid)


            // insert data to db
            await this.insertPlaylist(playlistId, playlistName, items)
            await this.insertTracks(playlistId, items)


        }catch(err){

            console.log(err)

        }
    }
    // playlist
    async insertPlaylist(playlistId, playlistName, items){
        try{

            const track_order = items.map(item => item.videoId)
            const playlist = {_id: playlistId, playlistName, track_order}
            await insertOrUpdatePlaylist(playlistId, playlist)

        }catch(err){

            console.log(err)

        }
    }
    // track
    async insertTracks(playlistId, items){
        try{
            
            const tracksInYT = items
            const tracksInDB = await getAllTracksByPlaylistId(playlistId)
            const tracksToInsert = _.differenceWith(tracksInYT, tracksInDB, (x, y) => x.videoId === y.track_id)

            if(tracksToInsert.length === 0){
                console.log('stop upload')
                return
            }
            
            console.log('upload track start')
            console.log(tracksToInsert)

            const tracks = await this.uploadTrackByBatch(playlistId, tracksToInsert)
            await insertOrUpdateTracks(playlistId, tracks)
    
        }catch(err){

            console.log(err)

        }
    }
    async uploadTrackByBatch(playlistId, items){
        try{


            // process promises by batch 
            const {batchSize} = this
            const promises = []

            for(let i = 0; i < items.length; i += batchSize){

                const startIdx = i
                const endIdx = i + batchSize
                const batch = items.slice(startIdx, endIdx).map(item => this.uploadTrack(item))
                promises.push(await Promise.all(batch))

                console.log('batch length: ', promises.length)

            }


            // wait all batch
            const tracks = (await Promise.all(promises)).flat().map(item => ({...item, playlist: playlistId}))


            return tracks

        }catch(err){

            console.log(err)

        }
    }
    async uploadTrack(item){
        try{

            const {storage} = this
            const {videoId, thumbnailUrl, videoUrl, artist, title} = item
    

            // create and save image, audio file on local
            const {main_color, savePath: localImagePath} = await processImage(videoId, thumbnailUrl)
            const localAudioPath = await processVideo(videoId, videoUrl)
    
    
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
            const [thumbnail_url, audio_url] = await Promise.all(blobs.map(blob => storage.uploadBlob(blob)))
    
    
            // delete local file
            await deleteLocalFile([localImagePath, localAudioPath])
    
    
            return {track_id: videoId, artist, title, main_color, thumbnail_url, audio_url}
    
        }catch(err){
    
            console.log(err)
    
        }
    }



    // delete tracks not in youtube playlist
    async delete(){
        console.log('delete start')
        await Promise.all(this.playlistIds.map(pid => this.deleteWorks(pid)))
        console.log('delete done')
    }
    async deleteWorks(pid){
        try{
            
            // filter tracks not in youtube playlist
            const {youtube} = this
            const {playlistId, playlistName, items} = await youtube.getDataFromYoutube(pid)
            const trackIdsInYT = items.map(item => item.videoId)
            const trackIdsInDB = (await getAllTracksByPlaylistId(pid)).map(item => item.track_id)
            const trackIdsToDelete = _.difference(trackIdsInDB, trackIdsInYT)
    

            // update playlist track order
            // delete tracks from db and storage
            await this.insertPlaylist(playlistId, playlistName, items)
            await this.deleteTracksFromDB(trackIdsToDelete)
            await this.deleteTracksFromStorageByBatch(trackIdsToDelete)

        }catch(err){

            console.log(err)

        }
    }
    async deleteTracksFromDB(trackIds){

        await deleteTracks(trackIds)
    }
    async deleteTracksFromStorageByBatch(trackIds){
        try{

            // process promises by batch 
            const {batchSize} = this
            const promises = []

            for(let i = 0; i < trackIds.length; i += batchSize){

                const startIdx = i
                const endIdx = i + batchSize
                const batch = trackIds.slice(startIdx, endIdx).map(trackId => this.deleteTracksFromStorage(trackId)) 

                promises.push(await Promise.all(batch))

            }


            // wait all batch
            await Promise.all(promises)

        }catch(err){

            console.log(err)

        }
    }
    async deleteTracksFromStorage(trackId){
        try{

            const {storage} = this

            const blobs = [
                {
                    containerName: process.env.THUMBNAIL_CONTAINER_NAME,
                    blobName: trackId + '.' + IMAGE_FORMAT
                },
                {
                    containerName: process.env.AUDIO_CONTAINER_NAME,
                    blobName: trackId + '.' + AUDIO_FORMAT
                }
            ]

            console.log(blobs)

            await Promise.all(blobs.map(blob => storage.deleteBlob(blob)))

        }catch(err){

            console.log(err)

        }
    }



    dispose(){

    }
}


export default TrackWorker