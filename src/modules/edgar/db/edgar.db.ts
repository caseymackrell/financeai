import {
	Document, model, Model, Schema,
} from 'mongoose'

export interface Company {
  cik: number;
  entityName: string;
  facts: {
    [key: string]: {
      [key: string]: {
        [key: string]: any;
      };
    };
  };
}

export interface CompanyDocument extends Company, Document {}

export type CompanyModel = Model<CompanyDocument>

const CompanySchema = new Schema<CompanyDocument>({
	cik: {
		type: Number,
		required: true,
	},
	entityName: {
		type: String,
		required: true,
	},
	facts: {
		type: Schema.Types.Mixed,
		required: true,
	},
}, {
	strict: false,
})

export default model<CompanyDocument, CompanyModel>('EdgarInfo', CompanySchema)
