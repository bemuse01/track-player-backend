import { google } from 'googleapis'
import { YOUTUBE_BASE_URL } from '../config/urls.js'
import 'dotenv/config'

const youtube = google.youtube({
    version: 'v3',
    auth: process.env.YOUTUBE_API_KEY
})

const getPlaylistInfo = async (playlist_id) => {
    try{

        const response = await youtube.playlists.list({
            part: 'snippet',
            id: playlist_id,
        })

        const {title} = response.data.items[0].snippet

        return {playlist_name: title}

    }catch(err){

        throw new Error(err.message)

    }
}

const getPlaylistItems = async (playlist_id) => {
    try{

        let nextPageToken = ''
        const listItems = []
        
        do{

            const response = await youtube.playlistItems.list({
                part: 'snippet',
                playlistId: playlist_id,
                maxResults: 50,
                pageToken: nextPageToken
            })
            
            const items = response.data.items.map(item => {
                const {artist, title, thumbnails, resourceId} = item.snippet
                const thumbnail = thumbnails.maxres.url
                const id = resourceId.videoId
                const video = YOUTUBE_BASE_URL + id

                return {title, artist, thumbnail, id, video}
            })
            listItems.push(...items)
            
            nextPageToken = response.data.nextPageToken

        }while(nextPageToken)

        return listItems

    }catch(err){

        console.log(err)
        throw new Error(err.message)

    }
}

const extractFromYoutube = async (playlist_id) => {
    try{
        
        const {playlist_name} = await getPlaylistInfo(playlist_id)
        const items = await getPlaylistItems(playlist_id)

        // console.log(title, items)

        return {playlist_name, items}

    }catch(err){

        console.log(err)
        throw new Error(err.message)

    }
}

export default extractFromYoutube