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
const schedulerId = 'track-scheduler'
const repeatOption = {
    every: 5000,
    immediately: true
}
const jobTemplate = {
    name: 'new-job',
    data: {msg: 'hello'},
}


// worker
const processor = async job => {
    console.log('job name: ', job.name)
}
const trackWorker = new Worker(queueName, processor, {connection})


// 
const initTrackQueue = async () => {
    await trackQueue.upsertJobScheduler(schedulerId, repeatOption, jobTemplate)
}


export {initTrackQueue}