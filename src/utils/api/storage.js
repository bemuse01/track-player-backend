import { BlobServiceClient } from '@azure/storage-blob'
import 'dotenv/config'

class Storage {
	constructor() {
		this.blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECT_URI)
	}

	// container
	async getContainer(containerName) {
		try {
			const { blobServiceClient } = this

			const containerClient = blobServiceClient.getContainerClient(containerName)
			await containerClient.createIfNotExists({ access: 'blob' })

			// if(!succeeded) throw new Error('container already exists')

			return containerClient
		} catch (err) {
			console.log(err)
		}
	}

	// upload
	async uploadBlob({ containerName, blobName, localPath }) {
		try {
			const containerClient = await this.getContainer(containerName)
			const blockBlobClient = await containerClient.getBlockBlobClient(blobName)

			await blockBlobClient.uploadFile(localPath)

			return blockBlobClient.url
		} catch (err) {
			console.log(err)
		}
	}

	// delete
	async deleteBlob({ containerName, blobName }) {
		try {
			const { blobServiceClient } = this

			const containerClient = blobServiceClient.getContainerClient(containerName)
			const blockBlobClient = await containerClient.getBlockBlobClient(blobName)

			const option = {
				deleteSnapshots: 'include',
			}

			await blockBlobClient.deleteIfExists(option)
		} catch (err) {
			console.log(err)
		}
	}
}

export default Storage
