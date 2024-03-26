const CustomPage = require('./helpers/page')

let page;

beforeEach(async() => {
    page = await CustomPage.build();
    await page.goto('http://localhost:3000')
});

afterEach(async() => {
    await page.close();
});

describe('When logged in', async () => {
    beforeEach(async () => {
        await page.login();
        await page.click('a.btn-floating');
    });

    test('Can see blog creation form', async () => {    
        const text = await page.getContentsOf('form label');
        expect(text).toEqual('Blog Title')
    });

    describe('And using valid inputs', async () => {
        beforeEach(async () => {
            await page.type('.title input', "this is a title dude");
            await page.type('.content input', "this is content dude");
            await page.click('form button');
        })

        test('Submitting text takes user to review blog', async () => {
            const text = await page.getContentsOf('h5');
            expect(text).toEqual('Please confirm your entries');
        })

        test('Submitting and saving takes user to list of blogs posted', async () => {
            await page.click('.green');
            await page.waitFor('.card');

            const title = await page.getContentsOf('.card-title');
            expect(title).toEqual('this is a title dude');
        })
    })

    describe('And using invalid inputs', async () => {
        beforeEach(async () => {
            await page.click('button.teal.btn-flat.right.white-text')
        })

        test('Can see error messages', async () => {
            const text = await page.getContentsOf('.title .red-text')
            const text1 = await page.getContentsOf('.content .red-text')
            expect(text).toEqual('You must provide a value')
            expect(text1).toEqual('You must provide a value')
        });
    });
});

describe("User is not logged in", async () => {
    test('User cannot create blog post', async () => {
        const result = await page.evaluate(() => {
                return fetch('/api/blogs', {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        title: 'This is a title',
                        content: 'This is content'
                    }) 
                }).then(res => res.json())
            })
        expect(result).toEqual({ error: 'You must log in!' });
    })

    test("User cannot get list of posts", async () => {
        const result = await page.evaluate(() => {
            return fetch('/api/blogs', {
                method: 'GET',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(res => res.json());
        })
        expect(result).toEqual({ error: 'You must log in!' });
    })
})