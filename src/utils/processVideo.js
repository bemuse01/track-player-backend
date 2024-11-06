import { AUDIO_SAVE_PATH } from '../config/urls.js'
import { AUDIO_FORMAT } from '../config/file.js'
import { exec } from 'child_process'


const download = (cmd) => {
    return new Promise((resolve, reject) => {
        exec(cmd, (err, stdout, stderr) => {

            if(err){
                console.log(err.message)
                reject(err)
                return
            }

            if(stderr){
                console.log(stderr)
                reject(stderr)
                return
            }

            resolve()
            console.log(stdout)

        })
    })
}

const processVideo = async (id, url) => {
    try{

        const savePath = `${AUDIO_SAVE_PATH}${id}.${AUDIO_FORMAT}`

        const command = `yt-dlp --extract-audio --audio-format ${AUDIO_FORMAT} -o "${savePath}" ${url}`

        await download(command)

        return savePath

    }catch(err){

        console.log(err)
        throw new Error(err.message, err)

    }
}


export default processVideo