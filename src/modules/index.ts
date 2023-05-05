import { Router, Request, Response } from 'express'
import { CompanyModel } from './edgar/db/edgar.db'
export const edgarRouter = Router()

edgarRouter.get('/', async (req: Request, res: Response) => {
	try {
		const companies = await CompanyModel.find({})
		res.status(200).send(companies)
	} catch (error) {
		console.log(error)
		res.status(500).send('Server Error')
	}
})
