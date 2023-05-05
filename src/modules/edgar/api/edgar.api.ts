import axios from 'axios'
import AdmZip = require('adm-zip');
import { Storage } from '@google-cloud/storage'
import { pipeline } from 'stream/promises'
import { Company } from '../db/edgar.db'
import mongoose from 'mongoose'

const credentials = {
	type: process.env.TYPE,
	project_id: process.env.PROJECT_ID,
	private_key_id: process.env.PRIVATE_KEY_ID,
	private_key: process.env.PRIVATE_KEY,
	client_email: process.env.CLIENT_EMAIL,
	client_id: process.env.CLIENT_ID,
	auth_uri: process.env.AUTH_URI,
	token_uri: process.env.TOKEN_URI,
	auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL,
	client_x509_cert_url: process.env.CLIENT_X509_CERT_URL,
}
const storage = new Storage({
	credentials,
})

async function fetchCompanyFactsData(): Promise<NodeJS.ReadableStream> {
	const response = await axios.get(
		'https://www.sec.gov/Archives/edgar/daily-index/bulkdata/submissions.zip',
		{ responseType: 'stream' }
	)
	if (!response.data) {
		throw new Error('No data received from URL.')
	}
	return response.data
}

async function parseCompanyFactsData(buffer: Buffer): Promise<any[]> {
	if (!buffer) {
		throw new Error('Buffer is null or undefined.')
	}

	const zip = new AdmZip(buffer)
	const files = zip.getEntries().filter((file) => /\.json$/i.test(file.name))

	if (!files.length) {
		throw new Error('No JSON files found in ZIP archive.')
	}

	const results: unknown[] = []
	for (const file of files) {
		const content = file.getData().toString('utf-8')
		const data = JSON.parse(content)
		results.push(data)
	}

	const companies = results as unknown as Company[]

	const transformedCompanies = companies.map((company: Company) => ({
		entityName: company.entityName,
		cik: company.cik,
		facts: company.facts,
	}))
	return transformedCompanies
}

async function saveCompanyFactsDataToDatabase(data: any[]): Promise<void> {
	const companyCollection = mongoose.connection.collection('edgar-info')
	for (const company of data) {
		const existingCompany = await companyCollection.findOne({ cik: company.cik })
		if (!existingCompany) {
			await companyCollection.insertOne(company)
		}
	}
}

export async function processCompanyFactsData(): Promise<void> {
	try {
		const fileStream = await fetchCompanyFactsData()
		const bucketName = 'YOUR_BUCKET_NAME'
		const fileName = 'submissions.zip'
		const bucket = storage.bucket(bucketName)
		const file = bucket.file(fileName)

		const stream = file.createWriteStream({
			resumable: false,
			metadata: {
				contentType: 'application/zip',
			},
		})

		stream.on('error', (err) => {
			console.error(err)
		})

		stream.on('finish', async () => {
			console.log(`File ${fileName} uploaded to bucket ${bucketName}.`)
			const buffer = await file.download()
			const data = await parseCompanyFactsData(buffer[0])
			await saveCompanyFactsDataToDatabase(data)
			console.log('Data saved to MongoDB')
		})

		await pipeline(fileStream, stream)
	} catch (error) {
		console.log(error)
	}
}
