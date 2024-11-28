import { AUDIO_SAVE_PATH } from '../../config/urls.js'
import { AUDIO_FORMAT } from '../../config/file.js'
import { spawn } from 'child_process'
import { mkdir } from 'fs/promises'

const download = (cmd, args) => {
    return new Promise((resolve, reject) => {
        const process = spawn(cmd, args)

        process.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`)
        })

        process.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`)
        })

        process.on('close', (code) => {
            if (code === 0) {
                console.log('Download complete.')
                resolve()
            } else {
                reject(new Error(`Process exited with code ${code}`))
            }
        })

        process.on('error', (err) => {
            reject(new Error(`Failed to start process: ${err.message}`))
        })
    })
}

const processAudio = async (id, url) => {
    try {
        await mkdir(AUDIO_SAVE_PATH, { recursive: true })

        const savePath = `${AUDIO_SAVE_PATH}${id}.${AUDIO_FORMAT}`

        const cmd = 'yt-dlp'
        const args = ['--extract-audio', '--audio-format', AUDIO_FORMAT, '-o', savePath, url]

        await download(cmd, args)

        return savePath
    } catch (err) {
        console.log(err)
    }
}

export { processAudio }
