import { BlobServiceClient } from '@azure/storage-blob'
import { EXPIRE_TIME } from '../../config/config.js'
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
			// await containerClient.createIfNotExists({ access: 'blob' })
			await containerClient.createIfNotExists()

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

	// get
	async getSasUrl({ containerName, blobName }) {
		try {
			const { blobServiceClient } = this

			const containerClient = blobServiceClient.getContainerClient(containerName)
			const blockBlobClient = await containerClient.getBlockBlobClient(blobName)

			const exist = await blockBlobClient.exists()

			if (exist) {
				const expiresOn = new Date()
				expiresOn.setHours(expiresOn.getHours() + EXPIRE_TIME)

				const permissions = 'r'

				const sasUrl = await blockBlobClient.generateSasUrl({ expiresOn, permissions })

				return sasUrl
			}

			return null
		} catch (err) {
			console.log(err)
		}
	}
}

export default Storage
