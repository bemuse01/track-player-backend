import { initTrackQueue } from '../queues/trackQueue.js'


const scheduler = async (fastify, options) => {
    console.log(fastify.diContainer.resolve('trackWorker'))
}


export default scheduler