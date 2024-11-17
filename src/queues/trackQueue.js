import { Queue, Worker } from 'bullmq'
import 'dotenv/config'


// connection
const connection = {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
}


// queue
const queueName = 'track-queue'
const trackQueue = new Queue(queueName, {connection})


// jobs
const schedulerName = 'track-scheduler'
const repeatOption = {
    every: 5000,
    immediately: true
}
const jobTemplate = (fastify) => ({
    name: 'track-job',
    data: {
        fastify,
        // msg: 'hello'
    },
    opts: {
        removeOnComplete: true, 
        removeOnFail: true 
    }
})


// worker
const processor = async job => {
    console.log('job name: ', job.name)
}
const trackWorker = new Worker(queueName, processor, {connection})


// 
const initTrackQueue = async (fastify) => {
    try{
        await trackQueue.obliterate()
        await trackQueue.upsertJobScheduler(schedulerName, repeatOption, jobTemplate(fastify))
    }catch(err){
        throw new Error(err.message)
    }
}


export {initTrackQueue}