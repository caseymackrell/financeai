import mongoose from 'mongoose'
// import logger from '../../utils/logger.util'

async function connectToDatabase() {
	try {
		await mongoose.connect(process.env.DB_URL || '')
		console.log('Connected to DB')
	} catch (error) {
		console.log('Could not connect to db', error)
		process.exit(1)
	}
}

export default connectToDatabase
