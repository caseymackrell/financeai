import * as express from 'express'

import router from './router'

const app = express()

// Pre-route middleware
app.use(express.json())
// Routes
router(app)

export default app
