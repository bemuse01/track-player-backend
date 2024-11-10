import { PROMISE_BATCH_SIZE } from '../config/config.js'
import { PLAYLIST_IDS } from '../config/urls.js'
import extractFromYoutube from './extractFromYoutube.js'
import processImage from './processImage.js'
import processVideo from './processVideo.js'
import deleteLocalFile from './deleteLocalFile.js'
import { insertOrFindPlaylist } from '../controllers/playlistController.js'
import { deleteTracks, getAllTracksByPlaylistId, insertOrUpdateTracks } from '../controllers/trackControllers.js'
import _ from 'lodash'
import { AUDIO_FORMAT, IMAGE_FORMAT } from '../config/file.js'


class TrackWorker{
    constructor({fastify, storage}){
        this.fastify = fastify
        this.youtube = this.fastify.youtube
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

            const {youtube} = this
            const {playlist_name, playlist_id, items} = await extractFromYoutube(youtube, pid)

            await this.insertPlaylist(playlist_id, playlist_name, items)
            await this.insertTracks(playlist_id, items)

        }catch(err){

            console.log(err)

        }
    }
    // playlist
    async insertPlaylist(playlist_id, playlist_name, items){
        try{

            const track_order = items.map(item => item.track_id)
            const playlist = {_id: playlist_id, playlist_name, track_order}
            await insertOrFindPlaylist(playlist_id, playlist)

        }catch(err){

            console.log(err)

        }
    }
    // track
    async insertTracks(playlist_id, items){
        try{
    
            const tracks = await this.uploadTrackByBatch(playlist_id, items)
            await insertOrUpdateTracks(tracks)
    
        }catch(err){

            console.log(err)

        }
    }
    async uploadTrackByBatch(playlist_id, items){
        try{

            const {batchSize} = this
            const promises = []

            for(let i = 0; i < items.length; i += batchSize){

                const startIdx = i
                const endIdx = i + batchSize
                const batch = items.slice(startIdx, endIdx).map(item => this.uploadTrack(item))
                promises.push(await Promise.all(batch))

                console.log('batch length: ', promises.length)

            }

            const tracks = (await Promise.all(promises)).flat().map(item => ({...item, playlist: playlist_id}))

            return tracks

        }catch(err){

            console.log(err)

        }
    }
    async uploadTrack(item){
        try{

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
            const [thumbnail_url, audio_url] = await Promise.all(blobs.map(blob => this.storage.uploadBlob(blob)))
    
    
            // delete local file
            await deleteLocalFile([localImagePath, localAudioPath])
    
    
            return {_id: track_id, artist, title, main_color, thumbnail_url, audio_url}
    
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

            const {youtube} = this
            const {playlist_id, playlist_name, items} = await extractFromYoutube(youtube, pid)
            const trackIdsInYT = items.map(item => item.track_id)
            const trackIdsInDB = (await getAllTracksByPlaylistId(pid)).map(item => item._id)
            const trackIdsToDelete = _.difference(trackIdsInDB, trackIdsInYT)
    
            await this.insertPlaylist(playlist_id, playlist_name, items)
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

            const {batchSize} = this
            const promises = []

            for(let i = 0; i < trackIds.length; i += batchSize){

                const startIdx = i
                const endIdx = i + batchSize
                const batch = trackIds.slice(startIdx, endIdx).map(trackId => this.deleteTracksFromStorage(trackId)) 

                promises.push(await Promise.all(batch))

            }

            await Promise.all(promises)

        }catch(err){

            console.log(err)

        }
    }
    async deleteTracksFromStorage(trackId){
        try{

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

            await Promise.all(blobs.map(blob => this.storage.deleteBlob(blob)))

        }catch(err){

            console.log(err)

        }
    }



    dispose(){

    }
}


export default TrackWorker