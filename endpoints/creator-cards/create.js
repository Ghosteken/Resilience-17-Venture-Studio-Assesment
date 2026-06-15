const { createHandler } = require('@app-core/server');
const createCreatorCardService = require('@app/services/creator-cards/create');
const { CREATOR_CARD_CREATED } = require('@app/messages/creator-card');

module.exports = createHandler({
  path: '/creator-cards',
  method: 'post',
  async handler(rc, helpers) {
    const response = await createCreatorCardService(rc.body);
    return {
      status: helpers.http_statuses.HTTP_200_OK,
      message: CREATOR_CARD_CREATED,
      data: response,
    };
  },
});
