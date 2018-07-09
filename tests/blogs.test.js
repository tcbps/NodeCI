const Page = require('./helpers/Page');
let page;


beforeEach(async () => {
    page = await Page.build();

    await page.goto('http://localhost:3000');
    // await page.login();
    // await page.click('a[href="/blogs/new"]');
});


afterEach(async () => {
    await page.close();
});


describe('when logged in and click new blogs icon', async () => {
    beforeEach(async () => {
        await page.goto('http://localhost:3000');
        await page.login();
        await page.click('a[href="/blogs/new"]');
    });


    test('should land on new blog form', async () => {
        const titleLabel = await page.getContentsOf('form label');
        expect(titleLabel).toEqual('Blog Title');
    });


    describe('submitting the form with no inputs', async () => {
       test('clicking the new blog form "next" button with no entries displays validation warnings', async () => {
            await page.click('form button.right');

            let validationMessage = await page.getContentsOf('.title .red-text');
            expect(validationMessage).toEqual('You must provide a value');

            validationMessage = await page.getContentsOf('.content .red-text');
            expect(validationMessage).toEqual('You must provide a value');
        });
    });


    describe('submitting the form using valid inputs', async () => {
        const newBlogTitle = 'New blog post';
        const newBlogContent = 'Blog post content.';


        beforeEach(async () => {
            await page.type('.title input', newBlogTitle);
            await page.type('.content input', newBlogContent);
            await page.click('form button.right');
        });


        test('the user is taken to the review screen', async () => {
            const reviewTitle = await page.getContentsOf('form h5');
            expect(reviewTitle).toEqual('Please confirm your entries');
        });


        test('submitting the reviewed post adds blog to "My blogs" listing', async () => {
            await page.click('form button.right');
            await page.waitFor('.card');

            const blogTitle = await page.getContentsOf('.card-title');
            expect(blogTitle).toEqual(newBlogTitle);

            const blogContent = await page.getContentsOf('.card-content p');
            expect(blogContent).toEqual(newBlogContent);
        });
    });
});


describe('when user is not logged in', async () => {
    test('user cannot create a blog post', async () => {
        const result = await page.post('/api/blogs', {
            title: 'My Title',
            content: 'My content',
        });

        expect(result).toEqual({ error: 'You must log in!' });
    });


    test('user cannot get a list of blog posts', async () => {
        const result = await page.get('/api/blogs');
        expect(result).toEqual({ error: 'You must log in!' });
    });
});