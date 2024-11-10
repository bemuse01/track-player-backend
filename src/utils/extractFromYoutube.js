import { YOUTUBE_BASE_URL } from '../config/urls.js'
import { ARTIST_REGEX } from '../config/config.js'
import { replaceText } from './helper.js'
import 'dotenv/config'

const getPlaylistInfo = async (youtube, pid) => {
    try{

        const response = await youtube.playlists.list({
            part: 'snippet',
            id: pid,
        })

        const item = response.data.items[0]
        const playlist_id = item.id
        const {title} = item.snippet

        return {playlist_name: title, playlist_id}

    }catch(err){

        console.log(err)

    }
}

const getPlaylistItems = async (youtube, pid) => {
    try{

        let nextPageToken = ''
        const listItems = []
        
        do{

            const response = await youtube.playlistItems.list({
                part: 'snippet',
                playlistId: pid,
                maxResults: 50,
                pageToken: nextPageToken
            })
            
            const items = response.data.items.map(item => {
                const {videoOwnerChannelTitle, title, thumbnails, resourceId} = item.snippet
                const artist = replaceText(ARTIST_REGEX, videoOwnerChannelTitle, ' ').trim()
                const thumbnailUrl = thumbnails.maxres.url
                const track_id = resourceId.videoId
                const videoUrl = YOUTUBE_BASE_URL + track_id

                console.log(artist, ', ', videoOwnerChannelTitle)

                return {title, artist, thumbnailUrl, track_id, videoUrl}
            })
            listItems.push(...items)
            
            nextPageToken = response.data.nextPageToken

        }while(nextPageToken)

        return listItems

    }catch(err){

        console.log(err)

    }
}

const extractFromYoutube = async (youtube, pid) => {
    try{
        
        const {playlist_name, playlist_id} = await getPlaylistInfo(youtube, pid)
        const items = await getPlaylistItems(youtube, pid)

        // console.log(title, items)

        return {playlist_name, playlist_id, items}

    }catch(err){

        console.log(err)

    }
}

export default extractFromYoutube