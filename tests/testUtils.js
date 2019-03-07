const puppeteer = require('puppeteer');
const appURL = 'http://localhost:3000';

module.exports = {
  faker: require('faker'),
  enums: require('tgb-shared/lib/enums'),
  sample: require('lodash/sample'),
  user: {username: 'user@test.com', password: 'password'},
  admin: {username: 'admin@test.com', password: 'password'},

  headlessTest(description, initialRoute, testFn) {
    const screenshotFilename = description.split(' ').map(s => s.replace(/\W/g, '')).join('_') + '.png';
    if(arguments.length === 2) {
      testFn = initialRoute;
      initialRoute = '/Login';
    } else {
      if(initialRoute[0] !== '/') initialRoute = '/' + initialRoute;
    }
  
    return test(description, async () => {
      const browser = await puppeteer.launch();
      let page;
      try {
        page = await browser.newPage();
        await page.goto(`${appURL}/#${initialRoute}`);
        await page.evaluate(() => {
          window.__HEADLESS_TEST = true;
        });
        await testFn(page, browser);
      } finally {
        await page.screenshot({path: `tests/screenshots/${screenshotFilename}`});
        await browser.close();
      }
    });
  },

  async login(page, credentials) {
    await page.type('input[type="email"]', credentials.username);
    await page.type('input[type="password"]', credentials.password);
    await page.tap('form button');
    await page.waitForFunction('window.store.initTask && window.store.initTask.resolved', {timeout: 5000});
    return page;
  },

  async fillCheckbox(page, selector) {
    await page.evaluate(`document.querySelector('${selector}').click()`);
  },

  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  async tapLink(page, href) {
    const selector = `a[href="${href}"]`;
    await page.waitForSelector(selector)
    await page.tap(selector);
    return page;
  },

  async expectSelector(page, selector, timeout) {
    timeout = (timeout == null ?  5000 : timeout);
    try {
      await page.waitForSelector(selector, {timeout});
      return page;
    } catch(error) {
      throw new Error(`Expected to find element ${selector} within ${timeout/1000} seconds.`)
    }
  },

  componentSelector(componentName) {
    return `*[class^='${componentName}']`;
  },

  async tapComponent(page, componentName) {
    return page.tap(this.componentSelector(componentName));
  },

  clickComponent(page, componentName) {
    return page.click(this.componentSelector(componentName));
  },

  async waitForComponent(page, ...path) {
    const selector = path.map(this.componentSelector).join(' ');
    return page.waitForSelector(selector);
  },

  expectLoggedIn(page, timeout) {
    return page.waitForFunction('!!window.store.loggedIn', {timeout});
  },

  dateToInputFormat(date) {
    return `${date.getMonth() + 1}-${date.getDate()}-${date.getFullYear()}`;
  },

  getInputValue(page, selector) {
    return page.evaluate(`document.querySelector('${selector}').value`);
  },

  async componentEl(page, componentName) {
    const selector = this.componentSelector(componentName);
    await page.waitForSelector(selector);
    return page.$(selector);
  },

  async clearAndType(page, selector, text) {
    const inputEl = await page.$(selector);
    if(inputEl) {
      await inputEl.click({clickCount: 3}); // select all
      await inputEl.type(text);
    }
    return inputEl;
  },

  nameSelector(name) {
    return `[name="${name}"]`;
  },

  selectByName(page, name) {
    return page.$(this.nameSelector(name));
  },

  scrollToBottom(page) {
    return page.evaluate(() => {
      window.scrollBy(0, document.body.scrollHeight);
    });
  }
};

// Bind all the exported modules so their `this` values don't break
Object.entries(module.exports).forEach(([key, value]) => {
  if(typeof value === 'function') module.exports[key] = value.bind(module.exports);
})
