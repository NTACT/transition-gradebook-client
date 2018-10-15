const {  headlessTest } = require('./testUtils');

describe('Test environment', () => {
  headlessTest('Should be able to access store', async page => {
    const storeExists = await page.evaluate('!!window.store');
    expect(storeExists).toBeTruthy();
  });
});
