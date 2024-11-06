import { unlink, access, constants } from 'fs/promises'

const deleteFile = async (path) => {
    try{
        
        await access(path, constants.F_OK)
        await unlink(path)

    }catch(err){
        
        console.log(err)
        throw new Error(err.message)

    }
}

const deleteLocalFile = async (paths) => {
    try{

        await Promise.all(paths.map(path => deleteFile(path)))

    }catch(err){

        console.log(err)
        throw new Error(err.message)

    }
}

export default deleteLocalFile