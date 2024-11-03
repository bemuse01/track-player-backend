import mongoose from 'mongoose'
import 'dotenv/config'

const connectDatabase = async () => {
    try{
        await mongoose.connect(process.env.MONGODB_URI)
        console.log('succes to connect')
    }catch(err){
        console.log('failed to connect', err)
    }
}

const disconnectDatabase = async () => {
    await mongoose.connection.close()
    console.log('disconnect database')
}

const dbConnector = async (fastify, options) => {
    fastify.addHook('onClose', disconnectDatabase)

    await connectDatabase()
}


export default dbConnector