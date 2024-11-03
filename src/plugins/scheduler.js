import { initTrackQueue } from '../queues/trackQueue.js'


const scheduler = async (fastify, options) => {
    await initTrackQueue()
}


export default scheduler