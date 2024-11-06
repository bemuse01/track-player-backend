import { BlobServiceClient } from '@azure/storage-blob'
import { DefaultAzureCredential } from '@azure/identity'
import 'dotenv/config'


const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECT_URI)

const createContainer = async (containerName) => {
    try{
        const containerClient = blobServiceClient.getContainerClient(containerName)
        await containerClient.createIfNotExists({access: 'blob'})

        // if(!succeeded) throw new Error('container already exists')

    }catch(err){

        console.error(err.message, err)

    }
}

const uploadBlob = async blob => {
    try{

        const {localPath, blobName, containerName} = blob
        const containerClient = blobServiceClient.getContainerClient(containerName)
        const blockBlobClient = containerClient.getBlockBlobClient(blobName)

        await blockBlobClient.uploadFile(localPath)

    }catch(err){

        console.log(err)
        throw new Error(err.message, err)

    }
}

const uploadFile = async (blobs) => {
    try{

        await createContainer(process.env.THUMBNAIL_CONTAINER_NAME)
        await createContainer(process.env.AUDIO_CONTAINER_NAME)

        // const blobs = [
        //     {
        //         localPath: './src/assets/images/maxresdefault.jpg',
        //         blobName: 'maxresdefault.jpg',
        //         containerName: process.env.THUMBNAIL_CONTAINER_NAME
        //     }
        // ]

        await Promise.all(blobs.map(blob => uploadBlob(blob)))

    }catch(err){

        console.log(err)
        throw new Error(err.message)

    }
}


export default uploadFile