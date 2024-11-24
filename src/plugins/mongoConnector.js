import mongoose from 'mongoose'
import 'dotenv/config'
import { registerHandler } from '../utils/api/processHandler.js'

const connect = async () => {
    try{
        await mongoose.connect(process.env.MONGODB_URI)
        console.log('succes to connect mongodb')
    }catch(err){
        console.log('failed to connect mongodb', err)
    }
}

const disconnect = async (msg) => {
    await mongoose.connection.close()
    console.log(msg + ' mongodb disconnected')
}

const mongoConnector = async (fastify, options) => {
    fastify.addHook('onClose', () => disconnect('on close:'))
    registerHandler(disconnect)

    await connect()
}


export default mongoConnector