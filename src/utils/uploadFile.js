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

const uploadBlob = async ({containerName, blobName, localPath}) => {
    try{

        const containerClient = blobServiceClient.getContainerClient(containerName)
        const blockBlobClient = await containerClient.getBlockBlobClient(blobName)

        await blockBlobClient.uploadFile(localPath)

        const url = blockBlobClient.url

        return url

    }catch(err){

        console.log(err)
        throw new Error(err.message, err)

    }
}

const getBlobUrl = () => {
    
}

const uploadFile = async (blob) => {
    try{

        // const blobName = 'maxresDefault.jpg'
        // const containerName = process.env.THUMBNAIL_CONTAINER_NAME
        // const localPath = './src/assets/images/maxresdefault.jpg'

        // const blob = {blobName, containerName, localPath}
 
        await createContainer(containerName)

        const url = await uploadBlob(blob)

        console.log(url)

    }catch(err){

        console.log(err)
        throw new Error(err.message)

    }
}


// export default uploadFile
uploadFile()