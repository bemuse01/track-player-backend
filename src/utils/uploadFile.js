import { BlobServiceClient, ContainerClient } from '@azure/storage-blob'
import { DefaultAzureCredential } from '@azure/identity'
import {v1 as uuidv1} from 'uuid'
import 'dotenv/config'


const blobServiceClient = new BlobServiceClient(
    `https://${process.env.AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net`,
    new DefaultAzureCredential()
)

const createContainer = async (containerName) => {
    try{
        const containerClient = blobServiceClient.getContainerClient(containerName)
        const {succeeded} = await containerClient.createIfNotExists()

        if(!succeeded) throw new Error('cannot create container')

    }catch(err){

        console.error(err.message, err)

    }
}

const uploadBlob = () => {
    try{




    }catch(err){

    }
}

const upload = async () => {
    try{

        await createContainer(process.env.THUMBNAIL_CONTAINER_NAME)
        await createContainer(process.env.AUDIO_CONTAINER_NAME)

        console.log(response)

    }catch(err){

        console.log(err.message)

    }
}

upload()