import { Response } from 'express'

type args = {
	status?: number;
	data?: any;
	res: Response
	error?: any
}

const response = ({
	res,
	data = null,
	status = 200,
	error = null,
}: args) => {
	try {
		console.log(`[Response] ${res.req.method} ${res.req.originalUrl}`)
		if (error) {
			console.log(`[Response] ${res.req.method} ${res.req.originalUrl} | ${JSON.stringify(error)}`)
		}
	} catch (error) { console.log(error) }
	return res
		.status(status)
		.send({
			data,
			error,
		})
}

export default response
