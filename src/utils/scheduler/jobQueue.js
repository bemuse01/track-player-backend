import { Queue, Worker } from 'bullmq'
import { createClient } from 'redis'
import 'dotenv/config'


class JobQueue{
    constructor({jobWorker}){
        this.jobWorker = jobWorker
        

        // queue db(redis) connection
        this.connection = {
            host: process.env.REDIS_HOST,
            port: process.env.REDIS_PORT,
            password: process.env.REDIS_PASSWORD,
        }


        // queue
        this.queueName = 'track-queue'
        this.queue = null


        // scheduler
        this.schedulerName = 'track-scheduler'
        this.schedulerOption = null
        this.schedulerJobTemplate = null


        // worker
        this.worker = null
        this.jobCount = 0


        this.init()
    }


    // init
    async init(){
        // await this.initClient()
        this.initQueue()
        this.initScheduler()
        this.initWorker()
    }


    // client
    async initClient(){
        const {host, port, password} = this.connection

        this.client = await createClient({
            socket: {
                host,
                port
            },
            password
        }).connect()
    }


    // queue
    initQueue(){
        this.queue = new Queue(this.queueName, {connection: this.connection})
    }


    // scheduler
    initScheduler(){
        this.schedulerOption = {
            // every: 1000 * 60 * 60 * 1, // every 1 hour
            every: 1000,
            immediately: true
        }
        this.schedulerJobTemplate = {
            name: 'track-job',
            data: {
                // msg: 'hello'
            },
            opts: {
                removeOnComplete: true, 
                removeOnFail: true 
            }
        }
    }


    // worker
    initWorker(){
        this.worker = new Worker(
            this.queueName, 
            async job => this.processor(job), 
            {
                connection: this.connection, 
                concurrency: 1 // max parallel work: 1
            }
        )
    }
    testWork(){
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve()
            }, 5000)
        })
    }
    async processor(job){
        console.log('job name: ', job.name)

        await this.testWork()

        console.log(`job done`)
    }


    // start
    async start(){
        try{

            await this.queue.obliterate({force: true})
            await this.queue.upsertJobScheduler(this.schedulerName, this.schedulerOption, this.schedulerJobTemplate)

        }catch(err){

            console.log(err)

        }
    }


    // 
    dispose(){

    }
}


export default JobQueue