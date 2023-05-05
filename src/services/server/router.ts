import { Application } from 'express'
import response from './response'
import * as cors from 'cors'
import { edgarRouter } from '../../modules/index'

const router = (app: Application) => {
	// Local modules
	app.use(cors({
		origin: 'http://localhost:3000',
	}))
	app.use('/edgar', edgarRouter)
	// Root & global route
	app.get('/', (_, res) => response({ res }))
	app.get('*', (_, res) => response({ res, status: 404, error: 'Not found' }))
}

export default router
