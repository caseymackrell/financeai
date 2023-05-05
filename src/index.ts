require('dotenv').config()
import server from './services/server'
import connectToDatabase from './services/db'
import { processCompanyFactsData } from './modules/edgar/api/edgar.api'

(async () => {
	try {
		// Setup database
		await connectToDatabase()
		await processCompanyFactsData()

		// Start server
		server.listen(process.env.PORT || 3000, () => {
			if (process.env.NODE_ENV === 'development') {
				console.log(`[Listening] Local: http://${require('os').hostname()}:${process.env.PORT || 3000}`)
			}
		})
	} catch (error) {
		console.log(error)
	}
})()
