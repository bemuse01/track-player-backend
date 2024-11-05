import sharp from 'sharp'
import axios from 'axios'
import { IMAGE_SAVE_PATH } from '../config/urls.js'
import { getColor } from 'colorthief'
import _ from 'lodash'


const toHex = (r, g, b) => {
    return [r, g, b].map(e => {
        const raw = e.toString(16)
        return raw.length === 1 ? '0' + raw : raw
    }).join('')
}

const toStringArray = (pixels, width, height, channels) => {

    const temp = []

    for(let i = 0; i < height; i++){

        for(let j = 0; j < width; j++){

            const idx = (i * width + j) * channels
            const r = pixels[idx + 0]
            const g = pixels[idx + 1]
            const b = pixels[idx + 2]
            const color = `${r},${g},${b}`

            temp.push(color)

        }
        
    }

    return temp
}

const processImage = async (id, url) => {
    try{

        const response = await axios({url, responseType: 'arraybuffer'})
        const input = response.data
        const image = sharp(input)
        const {width, height, channels} = await image.metadata()


        // resize
        const left = ~~((width - height) / 2)
        const top = 0
        const croppedImage = image.extract({left, top, width: height, height})


        // main color
        const size = 100
        const {data} = await sharp(input)
        .extract({left, top, width: height, height})
        .resize({width: size, height: size, fit: sharp.fit.fill})
        .raw()
        .toBuffer({resolveWithObject: true})

        const pixels = new Uint8ClampedArray(data.buffer)
        const pixelArray = toStringArray(pixels, size, size, channels)
        const counts = _.toPairs(_.countBy(pixelArray))
        const maxPixel = _.maxBy(counts, e => e[1])[0]
        const [r, g, b] = maxPixel.split(',').map(e => +e)
        const hex = toHex(r, g, b)


        // save
        const savePath = IMAGE_SAVE_PATH + id + '.jpg'
        await croppedImage.toFile(savePath)
        

        return {main_color: hex}

    }catch(err){

        console.log(err)
        throw new Error(err.message)

    }
}


export default processImage