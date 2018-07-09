const Page = require('./helpers/Page');
let page;


describe('test the navigation header bar', async () => {
    beforeEach(async () => {
        page = await Page.build();

        await page.goto('http://localhost:3000');
    });


    afterEach(async () => {
        await page.close();
    });


    test('the header has the correct text', async () => {
        const logoText = await page.getContentsOf('.brand-logo');
        expect(logoText).toEqual('Blogster');
    });


    test('clicking Login starts the OAuth flow', async () => {
        await page.click('nav .right a');

        const url = await page.url();
        expect(url).toMatch(/^https:\/\/accounts\.google\.com\//);
    });


    test('can see Logout button when logged in', async () => {
        await page.login();

        const logoutButton = await page.getContentsOf('a[href="/auth/logout"]');
        expect(logoutButton).toEqual('Logout');
    });
});