import fp from 'fastify-plugin'
import { BlobServiceClient } from '@azure/storage-blob'
import 'dotenv/config'


const azureStorage = fp((fastify, option) => {
    const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECT_URI)
    fastify.decorate('blobServiceClient', blobServiceClient)
})


export default azureStorage