const CustomPage = require('./helpers/page')
let page;

// The beforeEach is executed before each test
beforeEach(async () => {
    page = await CustomPage.build();
    await page.goto('http://localhost:3000')
})

// The afterEach is executed after each test
afterEach(async () => {
    await page.close();
})

test('Correct text in header', async () => {
    const text = await page.getContentsOf('a.brand-logo')
    expect(text).toEqual('Blogster');
})

test('Clicking login starts OAuth flow', async () => {
    await page.click('.right a');
    const url = await page.url();
    expect(url).toMatch(/accounts\.google\.com/)
})

test('When signed in, show logout button', async () => {
    await page.login();
    await page.waitFor('a[href="/auth/logout"]');
    const text = await page.$eval('a[href="/auth/logout"]', el=>el.innerHTML);

    expect(text).toEqual('Logout');
})