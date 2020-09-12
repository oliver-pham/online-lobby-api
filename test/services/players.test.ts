import assert from 'assert';
import app from '../../src/app';
import shortid from 'shortid';
import { PlayerData } from '../../src/services/players/players.class';
import { Id } from '@feathersjs/feathers';


export const PlayerTestSuite = {
  setSampleId: function (id: Object) {
    this.sampleId = id.toString();
  },
  getSampleId: function (): string {
    return this.sampleId;
  },
  createOnePlayer: async function (life?: number, score?: number) {
    const testValue: string = shortid.generate();
    const player: PlayerData = {
      name: testValue,
      life,
      score
    };
  
    return await app.service('players').create(player);
  },
  getOnePlayer: async function (id: Id, query?: object) {
    const params = {
      query
    };
  
    return await app.service('players').get(id, params);
  },
  updateOnePlayer: async function (id: Id, data: Object) {
    return await app.service('players').update(id, data);
  },
  removeOnePlayer: async function (id: Id) {
    try {
      await app.service('players').remove(id);
    } catch (err) {
      console.error(err);
    }
  }
};

const Assertor = {
  validatePlayer: async function (player: PlayerData) {
    describe('initializes all properties', () => {
      it('valid _id', () => {
        assert.equal(typeof player._id, "object");
      });

      it('valid name', () => {
        assert.equal(typeof player.name, "string");
      });

      it('valid life', () => {
        assert.ok(player.life >= 0 && player.life <= 2);
      });

      it('valid score', () => {
        assert.ok(player.score >= 0 && player.score <= Number.MAX_SAFE_INTEGER);
      });
    });
  },
  compare2Players: async function (p1: PlayerData, p2: PlayerData, props: string[]) {
    describe('compares two players', () => {
      for (let i = 0; i < props.length; i++) {
        it('same ' + props[i], () => {
          if (typeof p1[props[i]] === "object") {
            assert.strictEqual(JSON.stringify(p1[props[i]]), JSON.stringify(p2[props[i]]));
          }
          else {
            assert.strictEqual(p1[props[i]], p2[props[i]]);
          }
        });
      }
    });
  },
  contrast2Players: async function (p1: PlayerData, p2: PlayerData, props: string[]) {
    describe('contrasts two players', () => {
      for (let i = 0; i < props.length; i++) {
        it('different ' + props[i], () => {
          if (typeof p1[props[i]] === "object") {
            assert.notStrictEqual(JSON.stringify(p1[props[i]]), JSON.stringify(p2[props[i]]));
          }
          else {
            assert.notStrictEqual(p1[props[i]], p2[props[i]]);
          }
        });
      }
    });
  }
};

describe('\'players\' service', () => {
  before(async () => {
    const samplePlayer: PlayerData = await PlayerTestSuite.createOnePlayer();
    PlayerTestSuite.setSampleId(samplePlayer._id);
  });

  it('registered the service', () => {
    const service = app.service('players');

    assert.ok(service, 'Registered the service');
  });

  describe('test create method', () => {
    it('creates a default player', async () => {
      const player: PlayerData = await PlayerTestSuite.createOnePlayer();
  
      Assertor.validatePlayer(player);
      // Verify default life is 1
      assert.strictEqual(player.life, 1);
      // Verify default score is 0
      assert.strictEqual(player.score, 0);
  
      await PlayerTestSuite.removeOnePlayer(player._id);
    });
  
    it('creates a player with valid life', async () => {
      const testValue: number = 0;
      const player: PlayerData = await PlayerTestSuite.createOnePlayer(testValue);
  
      Assertor.validatePlayer(player);
      // Verify life has been set to custom value
      assert.strictEqual(player.life, testValue);
  
      await PlayerTestSuite.removeOnePlayer(player._id);
    });
  
    it('creates a player with invalid life', async () => {
      const testValue: number = 12;
      const player: PlayerData = await PlayerTestSuite.createOnePlayer(testValue);
  
      Assertor.validatePlayer(player);
      // Verify life has been set to empty/default state
      assert.strictEqual(player.life, 1);
  
      await PlayerTestSuite.removeOnePlayer(player._id);
    });
  
    it('creates a player with valid score', async () => {
      const testValue: number = 4;
      const player: PlayerData = await PlayerTestSuite.createOnePlayer(undefined, testValue);
  
      Assertor.validatePlayer(player);
      // Verify score has been set to custom value
      assert.strictEqual(player.score, testValue);
  
      await PlayerTestSuite.removeOnePlayer(player._id);
    });
  
    it('creates a player with invalid score', async () => {
      const testValue: number = -10;
      const player: PlayerData = await PlayerTestSuite.createOnePlayer(undefined, testValue);
  
      Assertor.validatePlayer(player);
      // Verify life has been set to empty/default state
      assert.strictEqual(player.score, 0);
  
      await PlayerTestSuite.removeOnePlayer(player._id);
    });
  });
  
  describe('test update method', () => {
    it('updates with valid life & score', async () => {
      const player = await PlayerTestSuite.getOnePlayer(PlayerTestSuite.getSampleId());
      const originalProps = ['_id', 'name'];
      const updatedProps = ['life', 'score'];
      const update = {
        name: player.name,
        life: 2,
        score: 42
      };
      const res: PlayerData = await PlayerTestSuite.updateOnePlayer(player._id, update);
  
      Assertor.compare2Players(res, player, originalProps);
      Assertor.contrast2Players(res, player, updatedProps);
    });
  
    it('updates with invalid life & score', async () => {
      const player = await PlayerTestSuite.getOnePlayer(PlayerTestSuite.getSampleId());
      const update = {
        name: player.name,
        life: 30,
        score: -10
      };
  
      const res: PlayerData = await PlayerTestSuite.updateOnePlayer(player._id, update);
  
      assert.strictEqual(JSON.stringify(res), JSON.stringify(player));
    });
  });

  after(async () => {
    return await PlayerTestSuite.removeOnePlayer(PlayerTestSuite.getSampleId());
  });
});
