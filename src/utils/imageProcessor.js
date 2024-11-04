import sharp from 'sharp'
import axios from 'axios'
import { IMAGE_SAVE_PATH } from '../config/urls.js'


const toHex = (r, g, b) => {
    return [r, g, b].map(e => {
        const raw = e.toString(16)
        return raw.length === 1 ? '0' + raw : raw
    }).join('')
}

const processImage = async (id, url) => {
    try{

        const url = 'https://i.ytimg.com/vi/PiIAVnFX2eo/maxresdefault.jpg'

        const response = await axios({url, responseType: 'arraybuffer'})
        const input = response.data
        const image = sharp(input)
        const {width, height} = await image.metadata()


        // resize
        const left = ~~((width - height) / 2)
        const top = 0
        const croppedImage = image.extract({left, top, width: height, height})

        
        // main color
        const {dominant} = await croppedImage.stats()
        const {r, g, b} = dominant
        const hex = toHex(r, g, b)


        // save
        const savePath = IMAGE_SAVE_PATH + id + '.jpg'
        await croppedImage.toFile(savePath)

        return {main_color: hex}

    }catch(err){

        throw new Error(err.message)

    }
}


export default processImage