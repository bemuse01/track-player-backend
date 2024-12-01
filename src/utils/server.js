import { diContainer, fastifyAwilixPlugin } from '@fastify/awilix'
import fastifyFormbody from '@fastify/formbody'
import { Lifetime, asClass, asFunction, asValue } from 'awilix'
import Fastify from 'fastify'
import { corsOption, fastifyCors } from '../plugins/cors.js'
import mongoConnector from '../plugins/mongoConnector.js'
import redisConnector from '../plugins/redisConnector.js'
import playlistRoute from '../routes/playlist.js'
import rootRoute from '../routes/root.js'
import trackRoute from '../routes/track.js'
import updateRoute from '../routes/update.js'
import Storage from './api/storage.js'
import Youtube from './api/youtube.js'
import JobQueue from './scheduler/jobQueue.js'
import JobWorker from './scheduler/jobWorker.js'
import 'dotenv/config'

class Server {
	constructor() {
		this.host = process.env.SERVER_HOST
		this.port = process.env.SERVER_PORT
		this.fastify = Fastify({ logger: true })

		this.init()
	}

	// init
	init() {
		this.registerPlugins()
		this.registerContainer()
		this.setEventHooks()
	}

	// plugins
	registerPlugins() {
		this.registerDependencies()
		this.registerRoutes()
	}
	// dependencies
	async registerDependencies() {
		this.fastify.register(fastifyFormbody)
		this.fastify.register(mongoConnector)
		this.fastify.register(redisConnector)
		this.fastify.register(fastifyAwilixPlugin, {
			disposeOnClose: true,
			disposeOnResponse: true,
			strictBooleanEnforced: true,
		})
		this.fastify.register(fastifyCors, corsOption)
	}
	// routes
	registerRoutes() {
		this.fastify.register(rootRoute)
		this.fastify.register(playlistRoute)
		this.fastify.register(trackRoute)
		this.fastify.register(updateRoute)
	}

	// awilix container
	registerContainer() {
		diContainer.register({
			fastify: asValue(this.fastify),
			youtube: asClass(Youtube, {
				lifetime: Lifetime.SINGLETON,
			}),
			storage: asClass(Storage, {
				lifetime: Lifetime.SINGLETON,
			}),
			jobQueue: asFunction(({ fastify, jobWorker }) => new JobQueue({ fastify, jobWorker }), {
				lifetime: Lifetime.SINGLETON,
				dispose: (module) => module.dispose(),
			}),
			jobWorker: asFunction(({ fastify, storage, youtube }) => new JobWorker({ fastify, storage, youtube }), {
				lifetime: Lifetime.SINGLETON,
				dispose: (module) => module.dispose(),
			}),
		})
	}

	// hook event
	setEventHooks() {
		this.fastify.ready((err) => this.onReady(err))
	}
	onReady(err) {
		if (err) throw new Error(err.message, err)
		// console.log(JSON.parse(process.env.CONTAINER_NAME))
		// const trackWorker = this.fastify.diContainer.resolve('jobWorker')
		// trackWorker.doWork()
		const jobQueue = this.fastify.diContainer.resolve('jobQueue')
		jobQueue.start()
	}

	// start
	async start() {
		try {
			await this.fastify.listen({ port: this.port, host: this.host })
		} catch (err) {
			this.fastify.log.error(err)
			process.exit(1)
		}
	}
}

export default Server
