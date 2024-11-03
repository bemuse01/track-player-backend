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

const disconnectDatabase = async (msg) => {
    await mongoose.connection.close()
    console.log(msg + ' database disconnected')
    process.exit(0)
}

const dbConnector = async (fastify, options) => {
    fastify.addHook('onClose', async () => disconnectDatabase('on close:'))
    process.on('SIGINT', async () => disconnectDatabase('SIGINT:'))

    await connectDatabase()
}


export default dbConnector