import { Schema, model } from 'mongoose'

interface Company {
  [key: string]: any;
}

const CompanySchema = new Schema<Company>({
	// Any field can be added to the schema using the Mixed type
}, {
	strict: false, // Disable strict mode to allow for dynamic schema
})

export const CompanyModel = model<Company>('Company', CompanySchema)
