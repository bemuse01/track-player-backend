import { initTrackQueue } from '../queues/trackQueue.js'


const scheduler = async (fastify, options) => {
    try{
        await initTrackQueue()
    }catch(err){
        console.log(err)
    }
}


export default scheduler