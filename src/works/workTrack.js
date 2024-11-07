import { PLAYLIST_IDS } from '../config/urls.js'
import { PROMISE_BATCH_SIZE } from '../config/const.js'
import extractFromYoutube from '../utils/extractFromYoutube.js'
import processImage from '../utils/processImage.js'
import processVideo from '../utils/processVideo.js'
import deleteLocalFile from '../utils/deleteLocalFile.js'

const doWork = async item => {
    try{

        const {id, thumbnail, video} = item

        // create and save image, audio file on local
        const {main_color, savePath: localImagePath} = await processImage(id, thumbnail)
        const localAudioPath = await processVideo(id, video)


        // upload to storage


        // delete local file
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

        const promiseArray = []
        const batchSize = PROMISE_BATCH_SIZE

        for(let i = 0; i < items.length; i += batchSize){
            const batch = items.slice(i, i + batchSize).map(item => doWork(item))
            promiseArray.push(await Promise.all(batch))
            console.log('batch length: ', promiseArray.length)
        }

        const info = (await Promise.all(promiseArray)).flat()
        console.log(info)

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