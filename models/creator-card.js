const { ModelSchema, SchemaTypes, DatabaseModel } = require('@app-core/mongoose');

const modelName = 'creator_cards';

/**
 * @typedef {Object} Link
 * @property {String} title
 * @property {String} url
 */

/**
 * @typedef {Object} Rate
 * @property {String} name
 * @property {String} description
 * @property {Number} amount
 */

/**
 * @typedef {Object} ServiceRates
 * @property {String} currency
 * @property {Rate[]} rates
 */

/**
 * @typedef {Object} CreatorCard
 * @property {String} _id
 * @property {String} title
 * @property {String} description
 * @property {String} slug
 * @property {String} creator_reference
 * @property {Link[]} links
 * @property {ServiceRates} service_rates
 * @property {String} status
 * @property {String} access_type
 * @property {String} access_code
 * @property {Number} created
 * @property {Number} updated
 * @property {Number|null} deleted
 */

const schemaConfig = {
  _id: { type: SchemaTypes.ULID, required: true },
  title: { type: SchemaTypes.String, required: true },
  description: { type: SchemaTypes.String },
  slug: { type: SchemaTypes.String, required: true, unique: true, index: true },
  creator_reference: { type: SchemaTypes.String, required: true, index: true },
  links: [
    {
      _id: false,
      title: { type: SchemaTypes.String },
      url: { type: SchemaTypes.String },
    },
  ],
  service_rates: {
    currency: { type: SchemaTypes.String, enum: ['NGN', 'USD', 'GBP', 'GHS'] },
    rates: [
      {
        _id: false,
        name: { type: SchemaTypes.String },
        description: { type: SchemaTypes.String },
        amount: { type: SchemaTypes.Number },
      },
    ],
  },
  status: { type: SchemaTypes.String, required: true, enum: ['draft', 'published'], index: true },
  access_type: { type: SchemaTypes.String, enum: ['public', 'private'], default: 'public' },
  access_code: { type: SchemaTypes.String },
  created: { type: SchemaTypes.Number, required: true },
  updated: { type: SchemaTypes.Number, required: true },
  deleted: { type: SchemaTypes.Number, default: null },
};

const modelSchema = new ModelSchema(schemaConfig, { collection: modelName });

/** @type {ModelSchema} */
module.exports = DatabaseModel.model(modelName, modelSchema);
