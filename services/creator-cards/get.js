const { throwAppError } = require('@app-core/errors');
const creatorCardRepository = require('@app/repository/creator-card');
const {
  CREATOR_CARD_NOT_FOUND,
  PRIVATE_CARD_ACCESS_CODE_REQUIRED,
  INVALID_ACCESS_CODE,
} = require('@app/messages/creator-card');

async function get(slug, accessCode) {
  const card = await creatorCardRepository.findOne({ query: { slug } });

  // 1. If no card exists or it is deleted -> NF01
  if (!card || card.deleted !== null) {
    throwAppError(CREATOR_CARD_NOT_FOUND, 'NF01');
  }

  // 2. If status is draft -> NF02
  if (card.status === 'draft') {
    throwAppError(CREATOR_CARD_NOT_FOUND, 'NF02');
  }

  // 3. If private and no access_code supplied -> AC03
  if (card.access_type === 'private' && !accessCode) {
    throwAppError(PRIVATE_CARD_ACCESS_CODE_REQUIRED, 'AC03');
  }

  // 4. If private and access_code doesn't match -> AC04
  if (card.access_type === 'private' && card.access_code !== accessCode) {
    throwAppError(INVALID_ACCESS_CODE, 'AC04');
  }

  // 5. Success
  const responseData = {
    ...card,
    id: card._id,
  };
  delete responseData._id;
  delete responseData.access_code;

  return responseData;
}

module.exports = get;
