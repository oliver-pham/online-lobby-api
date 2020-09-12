// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
import { Hook, HookContext } from '@feathersjs/feathers';
import shortid from 'shortid';


export class Range {
  constructor(public min: number, public max: number) {
    this.min = min;
    this.max = max;
  }
}

/*
export const validateId = (options = {}): Hook => {
  return async (context: HookContext) => {
    if (context.method === "create") {
      const { number } = context.data;
      const valid = _id && shortid.isValid(_id);
      // Check if _id has already been used?
      if (!valid)
        context.data._id = shortid.generate();
      return context;
    }
    else {
      if (context.id && shortid.isValid(context.id))
        return context;
      else
        throw new Error('Invalid id');
    }
  };
}
*/
export const validateName = (options = {}): Hook => {
  return async (context: HookContext) => {
    return context;
  };
}

export const validateLife = (options: Range): Hook => {
  return async (context: HookContext) => {
    let valid: boolean = context.data.life >= options.min && context.data.life <= options.max;
    if (context.data.life && !valid) {
      if (context.method === "create") {
        // Set to default/empty state
        const DEFAULT_VALUE = 1;
        context.data.life = DEFAULT_VALUE;
      }
      else {
        // Set to previous state
        const { life } = await context.app.service('players').get(context.id);
        context.data.life = life;
      }
    }
    
    return context;
  };
}

export const validateScore = (options: Range): Hook => {
  return async (context: HookContext) => {
    let valid: boolean = context.data.score >= options.min && context.data.score <= options.max;
    if (context.data.score && !valid) {
      // Set to default/empty state
      if (context.method === "create") {
        // Set to default/empty state
        const DEFAULT_VALUE = 0;
        context.data.score = DEFAULT_VALUE;
      }
      else {
        // Set to previous state
        const { score } = await context.app.service('players').get(context.id);
        context.data.score = score;
      }
    }

    return context;
  };
}

export const validateRole = (options = {}): Hook => {
  return async (context: HookContext) => {
    // Cross match if the role exists in database
    // Error handling?
    return context;
  };
}