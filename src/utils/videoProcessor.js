import { AUDIO_SAVE_PATH } from '../config/urls.js'
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

const processVideo = async () => {

    const url = 'https://www.youtube.com/watch?v=PiIAVnFX2eo'
    const id = 'PiIAVnFX2eo'
    const command = `yt-dlp --extract-audio --audio-format mp3 -o "${AUDIO_SAVE_PATH}${id}.%(ext)s" ${url}`

    await download(command)

}

processVideo()