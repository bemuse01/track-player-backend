import Fastify from 'fastify'
import { fastifyAwilixPlugin, diContainer } from '@fastify/awilix'
import { asClass, asFunction, asValue, Lifetime } from 'awilix'
import dbConnector from '../plugins/dbConnector.js'
import rootRoute from '../routes/root.js'
import trackRoute from '../routes/track.js'
import youtubeApi from '../plugins/youtubeApi.js'
import azureStorage from '../plugins/azureStorage.js'
import Scheduler from './scheduler.js'
import TrackWorker from './trackWorker.js'
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
        this.fastify.register(dbConnector)
        this.fastify.register(youtubeApi)
        this.fastify.register(azureStorage)
        this.fastify.register(fastifyAwilixPlugin, { disposeOnClose: true, disposeOnResponse: true, strictBooleanEnforced: true })
    }
    // routes
    registerRoutes(){
        this.fastify.register(rootRoute)
        this.fastify.register(trackRoute)
    }


    // awilix container
    registerContainer(){
        const {fastify} = this

        diContainer.register({
            fastify: asValue(this.fastify),
            trackWorker: asClass(TrackWorker, {
                lifetime: Lifetime.SINGLETON,
                dispose: module => module.dispose(),
            }).inject(() => ({fastify})),
            scheduler: asFunction(
                ({trackWorker}) => new Scheduler(trackWorker), 
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
        const trackWorker = this.fastify.diContainer.resolve('trackWorker')
        trackWorker.insert()
        // console.log(trackWorker.insertPlaylist)
        // const scheduler = this.fastify.diContainer.resolve('scheduler')
        // console.log(scheduler.dispose)
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
