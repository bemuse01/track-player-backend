import { unlink, access, constants, rm } from 'fs/promises'

const deleteFile = async (path) => {
    try {
        await access(path, constants.F_OK)
        await unlink(path)
    } catch (err) {
        console.log(err)
    }
}

const deleteDir = async (path) => {
    try {
        await rm(path, { recursive: true, force: true })
    } catch (err) {
        console.log(err)
    }
}

export { deleteFile, deleteDir }
