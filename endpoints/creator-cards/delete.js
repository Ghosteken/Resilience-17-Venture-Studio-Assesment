const { createHandler } = require('@app-core/server');
const deleteCreatorCardService = require('@app/services/creator-cards/delete');
const { CREATOR_CARD_DELETED } = require('@app/messages/creator-card');

module.exports = createHandler({
  path: '/creator-cards/:slug',
  method: 'delete',
  async handler(rc, helpers) {
    const { slug } = rc.params;
    const response = await deleteCreatorCardService(slug, rc.body);
    return {
      status: helpers.http_statuses.HTTP_200_OK,
      message: CREATOR_CARD_DELETED,
      data: response,
    };
  },
});
