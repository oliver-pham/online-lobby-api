import * as authentication from '@feathersjs/authentication';
import {
  validateLife,
  validateScore,
  Range
} from '../../hooks/validation';
// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = authentication.hooks;


export default {
  before: {
    all: [],
    find: [],
    get: [],
    create: [
      validateLife(new Range(0, 2)),
      validateScore(new Range(0, Number.MAX_SAFE_INTEGER))
    ],
    update: [
      validateLife(new Range(0, 2)),
      validateScore(new Range(0, Number.MAX_SAFE_INTEGER))
    ],
    patch: [
      validateLife(new Range(0, 2)),
      validateScore(new Range(0, Number.MAX_SAFE_INTEGER))
    ],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
