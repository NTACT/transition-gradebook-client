jest.setTimeout(60000);
const { 
  headlessTest,
  login,
  user,
  admin,
} = require('./testUtils');

describe('Authentication', () => {
  headlessTest('Should be able to login as a user', async page => {
    await login(page, user);
    const loggedIn = await page.evaluate(() => !!window.store.loggedIn);
    expect(loggedIn).toBeTruthy();
  });

  headlessTest('Should be able to login as an admin', async page => {
    await login(page, admin);
    const loggedIn = await page.evaluate(() => !!window.store.loggedIn);
    expect(loggedIn).toBeTruthy();
  });
});
