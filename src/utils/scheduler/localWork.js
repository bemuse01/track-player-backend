import { IMAGE_SAVE_PATH, AUDIO_SAVE_PATH } from '../../config/urls.js'
import { deleteDir } from '../api/local.js'

class LocalWork {
    async deleteAssets() {
        const dirs = [IMAGE_SAVE_PATH, AUDIO_SAVE_PATH]

        await Promise.all(dirs.map((dir) => deleteDir(dir)))
    }
}

export default LocalWork
