// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
import { Hook, HookContext } from '@feathersjs/feathers';

export default (options = {}): Hook => {
  return async (context: HookContext) => {
    const query = context.params.query || {};
    const fields = Object.keys(context.data);
    for (let i = 0; i < fields.length && query.field; i++) {
      if (fields[i] !== query.field)
        delete context.data[fields[i]];
    }

    return context;
  };
}
