import axios from 'axios'
import JSZip from 'jszip'
import mongoose from 'mongoose'

async function fetchCompanyFactsData(): Promise<Buffer> {
	const response = await axios.get('https://www.sec.gov/Archives/edgar/daily-index/xbrl/companyfacts.zip', {
		responseType: 'arraybuffer',
	})
	return response.data
}

async function parseCompanyFactsData(buffer: Buffer): Promise<any[]> {
	console.log(buffer)
	if (!buffer) {
		throw new Error('Buffer is null or undefined.')
	}

	const zip = await JSZip.loadAsync(buffer)
	const files = Object.values(zip.files).filter(file => /\.json$/i.test(file.name))

	if (!files.length) {
		throw new Error('No JSON files found in ZIP archive.')
	}

	const results: any[] = []
	for (const file of files) {
		const content = await file.async('string')
		const data = JSON.parse(content)
		results.push(data)
	}

	const transformedCompanies = results.map(company => ({
		name: company.name || '',
		cik: company.cik || '',
		// add more fields as needed
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
		const buffer = await fetchCompanyFactsData()
		const data = await parseCompanyFactsData(buffer)
		await saveCompanyFactsDataToDatabase(data)
		console.log('Data saved to MongoDB')
	} catch (error) {
		console.log(error)
	}
}

(async () => {
	try {
		await processCompanyFactsData()
	} catch (error) {
		console.log(error)
	}
})()
