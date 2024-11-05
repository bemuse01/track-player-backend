import { google } from 'googleapis'
import { PLAYLIST_ID, YOUTUBE_BASE_URL } from '../config/urls.js'
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

        return {artist: title}

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
                const thumbnail = thumbnails.maxres.url
                const id = resourceId.videoId
                const video = YOUTUBE_BASE_URL + id

                return {title, thumbnail, id, video}
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

const extractFromYoutube = async () => {
    try{
        
        const {artist} = await getPlaylistInfo()
        const items = await getPlaylistItems()

        // console.log(title, items)

        return {artist, items}

    }catch(err){

        console.log(err)
        throw new Error(err.message)

    }
}

export default extractFromYoutube