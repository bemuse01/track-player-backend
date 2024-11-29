import { PROMISE_BATCH_SIZE } from '../../config/config.js'
import { processImage } from '../api/image.js'
import { processAudio } from '../api/audio.js'
import { deleteLocalFile } from '../api/local.js'
import { AUDIO_FORMAT, IMAGE_FORMAT } from '../../config/file.js'

class StorageWork {
    constructor(storage) {
        this.storage = storage
        this.batchSize = PROMISE_BATCH_SIZE
    }

    // track

    // upload
    async uploadTrackFilesByBatch(playlistId, items) {
        // process promises by batch
        const { batchSize } = this
        const promises = []

        for (let i = 0; i < items.length; i += batchSize) {
            const startIdx = i
            const endIdx = i + batchSize
            const batch = items.slice(startIdx, endIdx).map((item) => this.uploadTrackFiles(item))
            promises.push(await Promise.all(batch))

            console.log('batch length: ', promises.length)
        }

        // wait all batch
        const tracks = (await Promise.all(promises)).flat().map((item) => ({ ...item, playlist: playlistId }))

        return tracks
    }
    async uploadTrackFiles(item) {
        const { storage } = this
        const { videoId, thumbnailUrl, videoUrl, artist, title } = item

        // create and save image, audio file on local
        const { main_color, savePath: localImagePath } = await processImage(videoId, thumbnailUrl)
        const localAudioPath = await processAudio(videoId, videoUrl)
        console.log(videoId, videoUrl, localAudioPath)

        if (!localImagePath) {
            throw new Error(`no local image error`)
        }

        if (!localAudioPath) {
            throw new Error(`no local audio error`)
        }

        // upload blob to storage
        const blobs = [
            {
                localPath: localImagePath,
                containerName: process.env.THUMBNAIL_CONTAINER_NAME,
                // blobName: localImagePath.split('/').pop(),
                blobName: videoId + '.' + IMAGE_FORMAT,
            },
            {
                localPath: localAudioPath,
                containerName: process.env.AUDIO_CONTAINER_NAME,
                // blobName: localAudioPath.split('/').pop(),
                blobName: videoId + '.' + AUDIO_FORMAT,
            },
        ]
        const [thumbnail_url, audio_url] = await Promise.all(blobs.map((blob) => storage.uploadBlob(blob)))

        // delete local file
        await deleteLocalFile([localImagePath, localAudioPath])

        return {
            track_id: videoId,
            artist,
            title,
            main_color,
            thumbnail_url,
            audio_url,
        }
    }

    // delete
    async deleteTrackFilesByBatch(trackIds) {
        // process promises by batch
        const { batchSize } = this
        const promises = []

        for (let i = 0; i < trackIds.length; i += batchSize) {
            const startIdx = i
            const endIdx = i + batchSize
            const batch = trackIds.slice(startIdx, endIdx).map((trackId) => this.deleteTrackFiles(trackId))

            promises.push(await Promise.all(batch))
        }

        // wait all batch
        await Promise.all(promises)
    }
    async deleteTrackFiles(trackId) {
        const { storage } = this

        const blobs = [
            {
                containerName: process.env.THUMBNAIL_CONTAINER_NAME,
                blobName: trackId + '.' + IMAGE_FORMAT,
            },
            {
                containerName: process.env.AUDIO_CONTAINER_NAME,
                blobName: trackId + '.' + AUDIO_FORMAT,
            },
        ]

        await Promise.all(blobs.map((blob) => storage.deleteBlob(blob)))
    }
}

export default StorageWork
