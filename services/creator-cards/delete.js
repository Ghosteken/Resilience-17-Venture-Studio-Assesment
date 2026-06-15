const { throwAppError } = require('@app-core/errors');
const creatorCardRepository = require('@app/repository/creator-card');
const { CREATOR_CARD_NOT_FOUND } = require('@app/messages/creator-card');
const validator = require('@app-core/validator');

const deleteSpec = `root {
  creator_reference string<length:20>
}`;

const parsedDeleteSpec = validator.parse(deleteSpec);

async function deleteCard(slug, serviceData) {
  const validatedData = validator.validate(serviceData, parsedDeleteSpec);

  const card = await creatorCardRepository.findOne({ query: { slug } });

  // 1. If no card exists or already deleted -> NF01
  if (!card || card.deleted !== null) {
    throwAppError(CREATOR_CARD_NOT_FOUND, 'NF01');
  }

  // Business Rule: Check creator_reference
  if (card.creator_reference !== validatedData.creator_reference) {
    throwAppError('Unauthorized to delete this card', 'PERMISSION_ERROR');
  }

  const now = Date.now();
  await creatorCardRepository.updateOne({
    query: { slug },
    updateValues: { deleted: now, updated: now },
  });

  // Transform _id to id for response and include updated timestamps
  const responseData = {
    ...card,
    id: card._id,
    deleted: now,
    updated: now,
  };
  delete responseData._id;

  return responseData;
}

module.exports = deleteCard;
