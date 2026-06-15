const assert = require('assert');
const { MockModelStubs } = require('@app/mock-models');
const createService = require('../services/creator-cards/create');
const getService = require('../services/creator-cards/get');
const deleteService = require('../services/creator-cards/delete');

describe('Creator Card Microservice', () => {
  let creatorCardStub;

  before(() => {
    process.env.USE_MOCK_MODEL = '1';
    creatorCardStub = MockModelStubs.CreatorCard;
  });

  describe('POST /creator-cards', () => {
    it('should create a full card successfully', async () => {
      const findOneStub = creatorCardStub.configureStubs({
        method: 'findOne',
        mockNull: true,
      });

      const payload = {
        title: 'George Cooks',
        description: 'Weekly cooking podcast',
        slug: 'george-cooks',
        creator_reference: 'crt_8f2k1m9x4p7w3q5z',
        links: [{ title: 'YouTube', url: 'https://youtube.com/@georgecooks' }],
        service_rates: {
          currency: 'NGN',
          rates: [{ name: 'IG Story Post', description: 'One story mention', amount: 5000000 }],
        },
        status: 'published',
      };

      try {
        const result = await createService(payload);
        assert.strictEqual(result.title, payload.title);
        assert.strictEqual(result.slug, payload.slug);
        assert.strictEqual(result.access_type, 'public');
        assert.ok(result.id);
      } finally {
        findOneStub.revert();
      }
    });

    it('should auto-generate a slug if omitted', async () => {
      const findOneStub = creatorCardStub.configureStubs({
        method: 'findOne',
        mockNull: true,
      });

      const payload = {
        title: 'Ada Designs Things',
        creator_reference: 'crt_a1b2c3d4e5f6g7h8',
        status: 'published',
      };

      try {
        const result = await createService(payload);
        assert.strictEqual(result.slug, 'ada-designs-things');
      } finally {
        findOneStub.revert();
      }
    });

    it('should create a private card with access_code', async () => {
      const findOneStub = creatorCardStub.configureStubs({
        method: 'findOne',
        mockNull: true,
      });

      const payload = {
        title: 'VIP Rate Card',
        creator_reference: 'crt_x9y8z7w6v5u4t3s2',
        status: 'published',
        access_type: 'private',
        access_code: 'A1B2C3',
      };

      try {
        const result = await createService(payload);
        assert.strictEqual(result.access_code, 'A1B2C3');
      } finally {
        findOneStub.revert();
      }
    });

    it('should throw SL02 for duplicate slug', async () => {
      const payload = {
        title: 'Another George',
        slug: 'george-cooks',
        creator_reference: 'crt_m1n2b3v4c5x6z7l8',
        status: 'published',
      };

      try {
        await createService(payload);
        assert.fail('Should have thrown SL02');
      } catch (error) {
        assert.strictEqual(error.errorCode, 'SL02');
      }
    });

    it('should throw AC01 if access_code is missing for private card', async () => {
      const payload = {
        title: 'Secret Card',
        creator_reference: 'crt_q1w2e3r4t5y6u7i8',
        status: 'published',
        access_type: 'private',
      };

      try {
        await createService(payload);
        assert.fail('Should have thrown AC01');
      } catch (error) {
        assert.strictEqual(error.errorCode, 'AC01');
      }
    });

    it('should throw AC05 if access_code is provided for public card', async () => {
      const payload = {
        title: 'Public Card',
        creator_reference: 'crt_q1w2e3r4t5y6u7i8',
        status: 'published',
        access_type: 'public',
        access_code: 'A1B2C3',
      };

      try {
        await createService(payload);
        assert.fail('Should have thrown AC05');
      } catch (error) {
        assert.strictEqual(error.errorCode, 'AC05');
      }
    });

    it('should throw validation error for invalid status (Test Case 10)', async () => {
      const payload = {
        title: 'Bad Status Card',
        creator_reference: 'crt_q1w2e3r4t5y6u7i8',
        status: 'archived',
      };

      try {
        await createService(payload);
        assert.fail('Should have thrown validation error');
      } catch (error) {
        assert.strictEqual(error.errorCode, 'SPCL_VALIDATION');
      }
    });

    it('should throw error for invalid link URL', async () => {
      const payload = {
        title: 'George Cooks',
        creator_reference: 'crt_8f2k1m9x4p7w3q5z',
        status: 'published',
        links: [{ title: 'YouTube', url: 'ftp://youtube.com' }],
      };

      try {
        await createService(payload);
        assert.fail('Should have thrown INVLDDATA');
      } catch (error) {
        assert.strictEqual(error.errorCode, 'INVALID_REQUEST_DATA');
      }
    });

    it('should throw AC01 for non-alphanumeric access_code', async () => {
      const payload = {
        title: 'Secret Card',
        creator_reference: 'crt_q1w2e3r4t5y6u7i8',
        status: 'published',
        access_type: 'private',
        access_code: 'A1B2-!',
      };

      try {
        await createService(payload);
        assert.fail('Should have thrown AC01');
      } catch (error) {
        assert.strictEqual(error.errorCode, 'AC01');
      }
    });
  });

  describe('GET /creator-cards/:slug', () => {
    it('should retrieve a public published card', async () => {
      const findOneStub = creatorCardStub.configureStubs({
        method: 'findOne',
        docConfig: { status: 'published', access_type: 'public', deleted: null },
      });

      try {
        const result = await getService('george-cooks');
        assert.strictEqual(result.slug, 'george-cooks');
        assert.strictEqual(result.access_code, undefined);
      } finally {
        findOneStub.revert();
      }
    });

    it('should retrieve a private card with correct pin', async () => {
      const findOneStub = creatorCardStub.configureStubs({
        method: 'findOne',
        docConfig: {
          status: 'published',
          access_type: 'private',
          access_code: 'A1B2C3',
          deleted: null,
        },
      });

      try {
        const result = await getService('vip-rate-card', 'A1B2C3');
        assert.strictEqual(result.slug, 'vip-rate-card');
        assert.strictEqual(result.access_code, undefined);
      } finally {
        findOneStub.revert();
      }
    });

    it('should throw NF01 for non-existent card (Test Case 11)', async () => {
      const findOneStub = creatorCardStub.configureStubs({
        method: 'findOne',
        mockNull: true,
      });

      try {
        await getService('does-not-exist-123');
        assert.fail('Should have thrown NF01');
      } catch (error) {
        assert.strictEqual(error.errorCode, 'NF01');
      } finally {
        findOneStub.revert();
      }
    });

    it('should throw NF02 for draft card', async () => {
      const findOneStub = creatorCardStub.configureStubs({
        method: 'findOne',
        docConfig: { status: 'draft', deleted: null },
      });

      try {
        await getService('my-draft-card');
        assert.fail('Should have thrown NF02');
      } catch (error) {
        assert.strictEqual(error.errorCode, 'NF02');
      } finally {
        findOneStub.revert();
      }
    });

    it('should throw AC03 for private card without pin', async () => {
      const findOneStub = creatorCardStub.configureStubs({
        method: 'findOne',
        docConfig: {
          status: 'published',
          access_type: 'private',
          access_code: 'A1B2C3',
          deleted: null,
        },
      });

      try {
        await getService('vip-rate-card');
        assert.fail('Should have thrown AC03');
      } catch (error) {
        assert.strictEqual(error.errorCode, 'AC03');
      } finally {
        findOneStub.revert();
      }
    });

    it('should throw AC04 for private card with wrong pin', async () => {
      const findOneStub = creatorCardStub.configureStubs({
        method: 'findOne',
        docConfig: {
          status: 'published',
          access_type: 'private',
          access_code: 'A1B2C3',
          deleted: null,
        },
      });

      try {
        await getService('vip-rate-card', 'WRONG1');
        assert.fail('Should have thrown AC04');
      } catch (error) {
        assert.strictEqual(error.errorCode, 'AC04');
      } finally {
        findOneStub.revert();
      }
    });

    it('should throw NF01 for retrieving a deleted card (Test Case 16)', async () => {
      const findOneStub = creatorCardStub.configureStubs({
        method: 'findOne',
        docConfig: { deleted: Date.now() },
      });

      try {
        await getService('ada-designs-things');
        assert.fail('Should have thrown NF01');
      } catch (error) {
        assert.strictEqual(error.errorCode, 'NF01');
      } finally {
        findOneStub.revert();
      }
    });
  });

  describe('DELETE /creator-cards/:slug', () => {
    it('should throw NF01 for deleting a non-existent card (Test Case 15)', async () => {
      const findOneStub = creatorCardStub.configureStubs({
        method: 'findOne',
        mockNull: true,
      });

      const payload = {
        creator_reference: 'crt_q1w2e3r4t5y6u7i8',
      };

      try {
        await deleteService('does-not-exist-123', payload);
        assert.fail('Should have thrown NF01');
      } catch (error) {
        assert.strictEqual(error.errorCode, 'NF01');
      } finally {
        findOneStub.revert();
      }
    });

    it('should delete a card successfully', async () => {
      const creatorRef = 'crt_a1b2c3d4e5f6g7h8';
      const findOneStub = creatorCardStub.configureStubs({
        method: 'findOne',
        docConfig: { creator_reference: creatorRef, deleted: null },
      });

      const payload = {
        creator_reference: creatorRef,
      };

      try {
        const result = await deleteService('ada-designs-things', payload);
        assert.ok(result.deleted);
        assert.strictEqual(result.slug, 'ada-designs-things');
      } finally {
        findOneStub.revert();
      }
    });

    it('should throw NF01 for already deleted card', async () => {
      const creatorRef = 'crt_a1b2c3d4e5f6g7h8';
      const findOneStub = creatorCardStub.configureStubs({
        method: 'findOne',
        docConfig: { creator_reference: creatorRef, deleted: Date.now() },
      });

      const payload = {
        creator_reference: creatorRef,
      };

      try {
        await deleteService('ada-designs-things', payload);
        assert.fail('Should have thrown NF01');
      } catch (error) {
        assert.strictEqual(error.errorCode, 'NF01');
      } finally {
        findOneStub.revert();
      }
    });
  });
});
