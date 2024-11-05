import extractFromYoutube from '../utils/extractFromYoutube.js'
import processImage from '../utils/processImage.js'
import processVideo from '../utils/processVideo.js'


const workTrack = async () => {
    const {artist, items} = await extractFromYoutube()
    const tracks = []


    // color
    const colors = await Promise.all(items.map(({id, thumbnail}) => processImage(id, thumbnail)))
    console.log(colors)

    
    // audio
    await Promise.all(items.map(({id, video}) => processVideo(id, video)))


    // data
    // const media_file = 'the media file url saved on cloud storage(azure, aws, gcp)'
    // const thumbnail = 'the thumbnail image file url saved on cloud storage(azure, aws, gcp)'
    // const data = items.map(({id, title}, idx) => ({id, artist, title, media_file, thumbnail, main_color: colors[idx]}))
}


workTrack()