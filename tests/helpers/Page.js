const puppeteer = require('puppeteer');

const sessionFactory = require('../factories/sessionFactory');
const userFactory = require('../factories/userFactory');


module.exports = class Page {
    constructor(page) {
        this.page = page;
    }


    static async build() {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox'],
        });

        const puppeteerPage = await browser.newPage();
        const page = new Page(puppeteerPage);

        return new Proxy(page, {
            get: function(target, property) {
                return page[property] || browser[property] || puppeteerPage[property];
            }
        });
    }


    async getContentsOf(selector) {
        return this.page.$eval(selector, el => el.innerHTML);
    }


    async login() {
        const user = await userFactory();
        const { session, sessionSig } = sessionFactory(user);

        await this.page.setCookie({ name: 'session', value: session });
        await this.page.setCookie({ name: 'session.sig', value: sessionSig });

        await this.page.goto('http://localhost:3000/blogs');
        await this.page.waitFor('a[href="/auth/logout"]');
    }


    async get(path) {
        return await this.page.evaluate(_path => (
            fetch(_path, {
                method: 'GET',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                },
            }).then(res => res.json())
        ), path);
    }


    async post(path, body) {
        return await this.page.evaluate((_path, _body) => (
            fetch(_path, {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(_body),
            }).then(res => res.json())
        ), path, body);
    }
};