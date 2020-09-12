import assert from 'assert';
import app from '../../src/app';
import shortid from 'shortid';

describe('\'users\' service', () => {
  var id: string;
  const randString: string = shortid.generate();

  it('registered the service', () => {
    const service = app.service('users');

    assert.ok(service, 'Registered the service');
  });
/*
  it('created a user, encrypts password', async () => {
    const user = await app.service('users').create({
      email: randString + "@gmail.com",
      password: randString
    });

    // Save user's id for subsequent removal
    id = user._id;
    // Verify email has been set
    assert.ok(user.email);
    // Verify password is encrypted
    assert.ok(user.password !== randString);
  });

  it('removed password for external requests', async () => {
    // Setting 'provider' indicates an external request
    const params = { provider: 'rest' };

    const user = await app.service('users').create({
      email: randString + "@gmail.com",
      password: randString
    }, params);

    // Verify password has been removed
    assert.ok(!user.password);
  });
*/
});
