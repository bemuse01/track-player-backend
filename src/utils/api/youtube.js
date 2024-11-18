import { YOUTUBE_BASE_URL } from '../../config/urls.js'
import { ARTIST_REGEX } from '../../config/config.js'
import { replaceText } from './helper.js'
import { google } from 'googleapis'
import 'dotenv/config'


class Youtube{
    constructor(){
        this.youtube = google.youtube({
            version: 'v3',
            auth: process.env.YOUTUBE_API_KEY
        })
    }

    async getDataFromYoutube(playlistId){
        try{
            
            const {playlist_name, playlist_id} = await this.getPlaylistInfo(playlistId)
            const items = await this.getPlaylistItems(playlistId)
    
            // console.log(title, items)
    
            return {playlistName: playlist_name, playlistId: playlist_id, items}
    
        }catch(err){
    
            console.log(err)
    
        }
    }
    async getPlaylistInfo(playlistId){
        try{

            const {youtube} = this
    
            const response = await youtube.playlists.list({
                part: 'snippet',
                id: playlistId,
            })
    
            const item = response.data.items[0]
            const playlist_id = item.id
            const {title} = item.snippet
    
            return {playlist_name: title, playlist_id}
    
        }catch(err){
    
            console.log(err)
    
        }
    }
    async getPlaylistItems(playlistId){
        try{

            const {youtube} = this
    
            let nextPageToken = ''
            const listItems = []
            
            do{
    
                const response = await youtube.playlistItems.list({
                    part: 'snippet',
                    playlistId,
                    maxResults: 50,
                    pageToken: nextPageToken
                })
                
                const items = response.data.items.map(item => {
                    const {videoOwnerChannelTitle, title, thumbnails, resourceId} = item.snippet
                    const artist = replaceText(ARTIST_REGEX, videoOwnerChannelTitle, ' ').trim()
                    const thumbnailUrl = thumbnails.maxres.url
                    const videoId = resourceId.videoId
                    const videoUrl = YOUTUBE_BASE_URL + videoId
    
                    console.log(videoOwnerChannelTitle, ' -> ', artist)
    
                    return {title, artist, thumbnailUrl, videoId, videoUrl}
                })
                listItems.push(...items)
                
                nextPageToken = response.data.nextPageToken
    
            }while(nextPageToken)
    
            return listItems
    
        }catch(err){
    
            console.log(err)
    
        }
    }
}


export default Youtube