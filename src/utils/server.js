import Fastify from 'fastify'
import { fastifyAwilixPlugin, diContainer } from '@fastify/awilix'
import { asClass, asFunction, asValue, Lifetime } from 'awilix'
import fastifyFormbody from '@fastify/formbody'
import rootRoute from '../routes/root.js'
import trackRoute from '../routes/track.js'
import playlistRoute from '../routes/playlist.js'
import dbConnector from '../plugins/dbConnector.js'
import TrackQueue from './trackQueue.js'
import TrackWorker from './trackWorker.js'
import Storage from './storage.js'
import Youtube from './youtube.js'
import 'dotenv/config'


class Server{
    constructor(){
        this.port = process.env.SERVER_PORT
        this.fastify = Fastify({logger: true})

        this.init()
    }


    // init
    init(){
        this.registerPlugins()
        this.registerContainer()
        this.setEventHooks()
    }

    
    // plugins
    registerPlugins(){
        this.registerDependencies()
        this.registerRoutes()
    }
    // dependencies
    async registerDependencies(){
        this.fastify.register(fastifyFormbody)
        this.fastify.register(dbConnector)
        this.fastify.register(fastifyAwilixPlugin, { disposeOnClose: true, disposeOnResponse: true, strictBooleanEnforced: true })
    }
    // routes
    registerRoutes(){
        this.fastify.register(rootRoute)
        this.fastify.register(playlistRoute)
        this.fastify.register(trackRoute)
    }


    // awilix container
    registerContainer(){
        diContainer.register({
            fastify: asValue(this.fastify),
            youtube: asClass(Youtube, {
                lifetime: Lifetime.SINGLETON
            }),
            storage: asClass(Storage, {
                lifetime: Lifetime.SINGLETON
            }),
            trackQueue: asFunction(
                ({trackWorker}) => new TrackQueue({trackWorker}),
                {
                    lifetime: Lifetime.SINGLETON,
                    dispose: module => module.dispose()
                }
            ),
            trackWorker: asFunction(
                ({fastify, storage, youtube}) => new TrackWorker({fastify, storage, youtube}), 
                {
                    lifetime: Lifetime.SINGLETON,
                    dispose: module => module.dispose(),
                }
            )
        })
    }


    // hook event
    setEventHooks(){
        this.fastify.ready(err => this.onReady(err))
    }
    onReady(err){
        if(err) throw new Error(err.message, err)
        // console.log(JSON.parse(process.env.CONTAINER_NAME))
        // const trackWorker = this.fastify.diContainer.resolve('trackWorker')
        // trackWorker.doWork()
        const trackQueue = this.fastify.diContainer.resolve('trackQueue')
        trackQueue.start()
    }
    

    // start
    async start(){
        try{

            await this.fastify.listen({port: this.port})

        }catch(err){

            this.fastify.log.error(err)
            process.exit(1)

        }
    }
}


export default Server
