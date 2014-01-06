
# Example

1. Install dev dependencies:

```bash
npm install -d
cd example
```

2. Start app:

> `CLIENT_ID` is your Shopify app's API key
> `CLIENT_SECRET` is your Shopify app's secret key
> `EMAIL` is your Shopify Dev Store (or regular store) email address used to log in

```bash
CLIENT_ID=123456 CLIENT_SECRET=abcdef EMAIL=xyz@domain.com node app
```

3. Load <http://localhost/auth/shopify> and follow the instructions.

4. Refer to `app.js` for more information.
