import { google } from 'googleapis'
import { PLAYLIST_ID } from '../config/urls.js'
import 'dotenv/config'

const youtube = google.youtube({
    version: 'v3',
    auth: process.env.YOUTUBE_API_KEY
})

const getPlaylistInfo = async () => {
    try{

        const response = await youtube.playlists.list({
            part: 'snippet',
            id: PLAYLIST_ID,
        })

        const {title} = response.data.items[0].snippet

        return {title}

    }catch(err){

        throw new Error(err.message)

    }
}

const getPlaylistItems = async () => {
    try{

        let nextPageToken = ''
        const listItems = []
        
        do{

            const response = await youtube.playlistItems.list({
                part: 'snippet',
                playlistId: PLAYLIST_ID,
                maxResults: 50,
                pageToken: nextPageToken
            })
            
            const items = response.data.items.map(item => {
                const {title, thumbnails, resourceId} = item.snippet
                const {url} = thumbnails.maxres
                const {videoId} = resourceId

                return {title, thumbnail: url, videoId}
            })
            listItems.push(...items)
            
            nextPageToken = response.data.nextPageToken

        }while(nextPageToken)

        return listItems

    }catch(err){

        throw new Error(err.message)

    }
}

const extractFromYoutube = async () => {
    try{
        
        const {title} = await getPlaylistInfo()
        const items = await getPlaylistItems()

        console.log(title, items)

        return {title, items}

    }catch(err){

        throw new Error(err.message)

    }
}

export default extractFromYoutube