const validator = require('@app-core/validator');
const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const creatorCardRepository = require('@app/repository/creator-card');
const generateULID = require('@app-core/randomness/ulid');
const generateRandomValues = require('@app-core/randomness/random-bytes');

const createSpec = `root {
  title string<lengthBetween:3,100>
  description? string<maxLength:500>
  slug? string<lengthBetween:5,50>
  creator_reference string<length:20>
  links[]? {
    title string<lengthBetween:1,100>
    url string<maxLength:200>
  }
  service_rates? {
    currency string<isAnyOf:NGN,USD,GBP,GHS>
    rates[] {
      name string<lengthBetween:3,100>
      description string<maxLength:250>
      amount integer<min:1>
    }
  }
  status string<isAnyOf:draft,published>
  access_type? string<isAnyOf:public,private>
  access_code? string<length:6>
}`;

const parsedCreateSpec = validator.parse(createSpec);

async function generateSlug(title) {
  const baseSlug = title
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-_]/g, '');

  let slug = baseSlug;
  let isTaken = true;
  let attempts = 0;

  // Requirement: If shorter than 5 characters, we MUST append a suffix immediately
  if (slug.length < 5) {
    slug = `${slug}-${generateRandomValues(6)}`;
  }

  // Check uniqueness and retry if needed
  while (isTaken && attempts < 5) {
    // eslint-disable-next-line no-await-in-loop
    const existing = await creatorCardRepository.findOne({ query: { slug } });
    if (existing) {
      slug = `${baseSlug}-${generateRandomValues(6)}`;
      attempts += 1;
    } else {
      isTaken = false;
    }
  }

  return slug;
}

async function create(serviceData) {
  // Field-level validation using VSL
  const validatedData = validator.validate(serviceData, parsedCreateSpec);

  // Business Rule: access_code conditional rules
  const accessType = validatedData.access_type || 'public';
  if (accessType === 'private' && !validatedData.access_code) {
    throwAppError('access_code is required when access_type is private', 'AC01');
  }
  if (accessType === 'public' && validatedData.access_code) {
    throwAppError('access_code can only be set on private cards', 'AC05');
  }

  // Business Rule: access_code alphanumeric check
  if (validatedData.access_code && !/^[a-zA-Z0-9]+$/.test(validatedData.access_code)) {
    throwAppError('access_code must be alphanumeric', 'AC01');
  }

  // Business Rule: links URL validation (starts with http:// or https://)
  if (validatedData.links) {
    validatedData.links.forEach((link, index) => {
      if (!/^https?:\/\//.test(link.url)) {
        throwAppError(
          `Link at index ${index} must start with http:// or https://`,
          ERROR_CODE.INVLDDATA
        );
      }
    });
  }

  // Handle Slug
  if (validatedData.slug) {
    // Check if provided slug is alphanumeric + hyphen/underscore
    if (!/^[a-zA-Z0-9\-_]+$/.test(validatedData.slug)) {
      throwAppError('Slug contains invalid characters', 'SL02');
    }
    const existing = await creatorCardRepository.findOne({ query: { slug: validatedData.slug } });
    if (existing) {
      throwAppError('Slug is already taken', 'SL02');
    }
  } else {
    validatedData.slug = await generateSlug(validatedData.title);
  }

  const now = Date.now();
  const cardData = {
    _id: generateULID(),
    ...validatedData,
    access_type: accessType,
    created: now,
    updated: now,
    deleted: null,
  };

  const newCard = await creatorCardRepository.create(cardData);

  // Transform _id to id for response
  const responseData = newCard.toObject ? newCard.toObject() : { ...newCard };
  responseData.id = responseData._id;
  delete responseData._id;
  delete responseData.__v;

  return responseData;
}

module.exports = create;
