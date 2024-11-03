import Fastify from 'fastify'
import dbConnector from './plugins/dbConnector.js'
import rootRoute from './routes/root.js'
import trackRoute from './routes/track.js'
import scheduler from './plugins/scheduler.js'


const fastify = Fastify({ logger: true })

fastify.register(dbConnector)
fastify.register(scheduler)
fastify.register(rootRoute)
fastify.register(trackRoute)

const start = async () => {
    try{
        await fastify.listen({port: 8000})
    }catch(err){
        fastify.log.error(err)
        process.exit(1)
    }
}

start()