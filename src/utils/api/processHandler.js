const handlers = []

process.on('SIGINT', async () => {
	// for(const handler of handlers){
	//     await handler('SIGINT:')
	// }
	await Promise.all(handlers.map((handler) => handler('SIGINT:')))
	process.exit(0)
})

const registerHandler = (handler) => {
	handlers.push(handler)
}

export { registerHandler }
