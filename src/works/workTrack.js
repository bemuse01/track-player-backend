import extractFromYoutube from '../utils/extractFromYoutube.js'
import processImage from '../utils/processImage.js'
import processVideo from '../utils/processVideo.js'
import { PLAYLIST_IDS } from '../config/urls.js'
import deleteLocalFile from '../utils/deleteLocalFile.js'

const doWork = async item => {
    try{

        const {id, thumbnail, video} = item

        const {main_color, savePath: localImagePath} = await processImage(id, thumbnail)
        const localAudioPath = await processVideo(id, video)
        await deleteLocalFile([localImagePath, localAudioPath])

        return {main_color}

    }catch(err){

        console.log(err)
        throw new Error(err.message)

    }
}

const createAllData = async playlist_id => {
    try{
        const {playlist_name, items} = await extractFromYoutube(playlist_id)

        const info = await Promise.all(items.map(item => doWork(item)))

    }catch(err){
        console.log(err)
    }
}

const workTrack = async () => {

    await Promise.all(PLAYLIST_IDS.map(playlist_id => createAllData(playlist_id)))

    // const {artist, items} = await extractFromYoutube(playlist_id)
    // const tracks = []


    // // color
    // const colors = await Promise.all(items.map(({id, thumbnail}) => processImage(id, thumbnail)))
    // console.log(colors)

    
    // // audio
    // await Promise.all(items.map(({id, video}) => processVideo(id, video)))


    // data
    // const media_file = 'the media file url saved on cloud storage(azure, aws, gcp)'
    // const thumbnail = 'the thumbnail image file url saved on cloud storage(azure, aws, gcp)'
    // const data = items.map(({id, title}, idx) => ({id, artist, title, media_file, thumbnail, main_color: colors[idx]}))
}


workTrack()