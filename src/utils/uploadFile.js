import 'dotenv/config'


const createContainer = async (blobServiceClient, containerName) => {
    try{
        const containerClient = blobServiceClient.getContainerClient(containerName)
        await containerClient.createIfNotExists({access: 'blob'})

        // if(!succeeded) throw new Error('container already exists')

    }catch(err){

        console.log(err)

    }
}

const uploadBlob = async (blobServiceClient, {containerName, blobName, localPath}) => {
    try{

        const containerClient = blobServiceClient.getContainerClient(containerName)
        const blockBlobClient = await containerClient.getBlockBlobClient(blobName)

        await blockBlobClient.uploadFile(localPath)

        const url = blockBlobClient.url

        return url

    }catch(err){

        console.log(err)

    }
}

const uploadFile = async (blobServiceClient, blob) => {
    try{

        // const blobName = 'maxresDefault.jpg'
        // const containerName = process.env.THUMBNAIL_CONTAINER_NAME
        // const localPath = './src/assets/images/maxresdefault.jpg'

        // const blob = {blobName, containerName, localPath}
 
        await createContainer(blobServiceClient, containerName)

        const url = await uploadBlob(blobServiceClient, blob)

        console.log(url)

        return url

    }catch(err){

        console.log(err)

    }
}


export default uploadFile