const { createHandler } = require('@app-core/server');
const getCreatorCardService = require('@app/services/creator-cards/get');
const { CREATOR_CARD_RETRIEVED } = require('@app/messages/creator-card');

module.exports = createHandler({
  path: '/creator-cards/:slug',
  method: 'get',
  async handler(rc, helpers) {
    const { slug } = rc.params;
    const { access_code: accessCode } = rc.query;

    const response = await getCreatorCardService(slug, accessCode);
    return {
      status: helpers.http_statuses.HTTP_200_OK,
      message: CREATOR_CARD_RETRIEVED,
      data: response,
    };
  },
});
