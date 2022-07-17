# LABORATORY-BOT-SLACK

This project is a small laboratory for testing how to create a bot for Slack. I described the whole process in the development section with multiple screen for showing what to do and where.

The example here is a minimal bot that will respond at every message. The goal was really to provide the minimim required for having a functionning bot as fast as possible. Feel free to modify it using the Slack api: https://api.slack.com/methods  

## Plan of the presentation

I explain with all the details how I build the project and my way of working.

1. [ERD](#erd)
2. [Documentation](#documentation)
3. [Organization](#organization)
4. [Development](#development)
5. [Seeding](#seeding)
6. [Testing](#testing)
7. [Admin](#admin)
8. [Monitoring](#monitoring)
9. [Security](#security)
10. [Running](#running)
11. [Deployment](#deployment)

## ERD

`Graphql-voyager` has been added as a middleware so you can visualize the ERD on the following endpoint : `/erd`

```
http://localhost:5000/erd
```

## Documentation

#### Server documentation

The documentation of the server can be access at this endpoint. It gives information about the server, the tools and how to use the API. Open a browser and go to the following URL :

```
http://localhost:5000/documentation
```

#### Code documentation

The jsdoc can be generated locally with the following command :

```
npm run build:docs
```

#### Online API documentation

The playground of the apollo server is activated, so the documentation and the json format can be access at the endpoint of the api. Open a browser and browse to the following URL :

```
http://localhost:5000/api/graphql
```

#### Local API documentation

Since it's a graphql, anyone can generate the documentation by introspection. I suggest to use this tool `2fd/graphdoc` with the following commands :

```
npm install -g @2fd/graphdoc
graphdoc -e http://localhost:5000/api/graphql -o ./doc/schema
```

A html doc will be then found inside the directory **/doc/schema**.

## Organization

#### Organization of the global folder

| Folder's Name | Description of the folder                               |
| :------------ | :------------------------------------------------------ |
| documentation | Everything related to the documentations                |
| env           | Regroup the global constant of the app                  |
| seeding       | Regroup the seed of the app for populating the database |
| src           | Regroup the source code                                 |
| test          | Regroup the test                                        |

#### Organization of the src folder

| Folder's Name | Description of the folder                               |
| :------------ | :------------------------------------------------------ |
| dbs           | Regroup the direct call to the database                 |
| libs          | Regroup the utils and global functions                  |
| models        | Regroup the models                                      |
| routes        | Regroup the routes if needed                            |
| services      | Regroup the services of the app                         |
| types         | Regroup the types for graphQL                           |

## Development

#### How the create a bot for Slack

0- The first step is to have our server running through a ngrok.

* Create an account on ngrok (https://ngrok.com/)
* Install globally ngrok
```bash
curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null && echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list && sudo apt update && sudo apt install ngrok
```
* Authentificate ngrok on our machine with the credential obtain with our registration
```bash
ngrok config add-authtoken <token>
```
* Start a tunnel on the open port (in our case 5000)
```bash
ngrok http 5000
```

1- We need to create and configure our app on Slack.
Go on the following link: https://api.slack.com/apps/

Add click, on the menu `Create New App`

![Alt text](documentation/pictures/1.png?raw=true "SLACK")

On the following screen, choose the `from scratch` option and choose a name for your app and in which Slack you want to install it.

2- We need to choose the permission for our app. In the menu `OAuth & Permission` under `Features`, we will scroll down until we reach the section `Scope`.

![Alt text](documentation/pictures/2.png?raw=true "SLACK")

Click on the button `Add an OAuth Scope` and choose the following permissions:
* channels:history
* channels:read
* channels:write

3. It is start to code and to create our endpoint watching for event from slack.
We create a file `slack.js` inside the `routes` folder containing the connection:

```js
const eventsApi = require('@slack/events-api')
const slackEvents = eventsApi.createEventAdapter(process.env.SIGNING_SECRET)
const { WebClient, LogLevel } = require('@slack/web-api')

const client = new WebClient(process.env.BOT_TOKEN, {
  logLevel: LogLevel.DEBUG
})

slackEvents.on('message', async (event) => {
  if (!event.subtype && !event.bot_id) {
    return client.chat.postMessage({
      channel: event.channel,
      text: 'Hello World!'
    })
  }
})

module.exports = slackEvents.expressMiddleware()
```

We add this file in our `server.js` file as follow:
```
server.use('/slack', require('./routes/slack'))
```

The two keys from the environment files can be found on the Slack website in the `Basic information` menu under `Settings`. If you scroll down, you should find everything needed in the section `App Credentials`.

![Alt text](documentation/pictures/4.png?raw=true "SLACK")

4- Since we will be using the event of slack, we need to configure the event subscription. In the menu `Event Subscription` under `Features`, click on the toggle on the top right side for activating the feature.

![Alt text](documentation/pictures/3.png?raw=true "SLACK")

Now, we need to verify the url. Fill up the request url with the url obtain from ngrok and add the path `/slack` at the end. If everything goes well, you should received the verified confirmation.

In the same panel, in the section below `Subscribe to bot events`, we click on the button `Add Bot User Event`. Since we will be posting over a message, we need to check for the event `message:channels`.

5- After that, we need to reinstall our app on Slakc. In the menu `Install App` under `Settings`, click on the button `reinstall app` to update the permission of your app.

![Alt text](documentation/pictures/6.png?raw=true "SLACK")

6- In your Slack, create a channel and once inside, click on the little arrow beside the name of the channel. In the popup opening, click on `Integration` and add your app.

![Alt text](documentation/pictures/5.png?raw=true "SLACK")

7- Now, if everything has been done correctly, you should be able to receive a message from your bot after writting a message.

#### Package explanation

* **@admin-bro/express**: A middleware for connecting express with admin-bro. I use it for creating the route of the admin bro.
* **@admin-bro/mongoose**: A middleware for connecting mongoose with admin bro. I use it for connecting admin bro to the mongoose schema.
* **admin-bro**: AdminBro is an admin interface for managing/editing the information in the database. It removes the need of building an admin interface. I use it because I cannot rely on someone else for building an admin interface if I work with a frontend.
* **apollo-server-express**: Apollo serves as an abstraction layer that decouples services and apps so that each can be developed independently of the other, in any language and on any platform. I use it for managing a graphQl.
* **basic-auth**: Basic Auth is used for protecting url and ressource by a htaccess authentication. I use it for protecting the admin bro route.
* **bcrypt**: A library for hashing information. I use it for hashing the password.
* **dotenv**: Dotenv is a zero-dependency module that loads environment variables from a .env file into process.env. I use it for creating an environment for the prod, stage, dev and local development.
* **email-validator**: Checking an email is a simple task but it can be tricky to check all the possibilities given by a particular RFC. I rely on this small package for checking the validity of an email.
* **express**: xpress is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications. I use it for managing the routes and the API.
* **express-session**: A middleware for managing the session through express. I use it for creating the account of the app.
* **express-status-monitor**: Simple, self-hosted module based on Socket.io and Chart.js to report realtime server metrics for Express-based node servers. I use this for checking the status of the server without connecting to aws.
* **graphQl**: GraphQL is an open-source data query and manipulation language for APIs, and a runtime for fulfilling queries with existing data. I use it because it give more flexibility for the frontend and it optimizes the query way better than REST.
* **graphql-tools**: This package provides a few useful ways to create a GraphQL schema. I use this for creating an introspection of the API and creating thing such as documentation and erd with the schema generated.
* **graphql-voyager**: With graphql-voyager you can visually explore your GraphQL API as an interactive graph. This is a great tool when designing or discussing your data model. I use it for letting people see the erd and the documentation behind the API without doing any effort.
* **helmet**: Helmet helps you secure your Express apps by setting various HTTP headers. I use it for hidding some header and protecting the app against well know weakness of Express.
* **isomorphic-fetch**: The Fetch API is currently not implemented consistently across browsers. This module will enable you to use fetch in your Node code in a cross-browser compliant fashion. I use it for testing the unit test, I call every endpoint with a fetch as any browser will do.
* **jsonwebtoken**: JSON Web Token (JWT) is a compact, URL-safe means of representing claims to be transferred between two parties. I use it for creating and managing the Bearer Token.
* **mailgun-js**: Node.js module for interacting with the Mailgun API. I use it for sending mail with Mailgun.
* **marked**: Low-level compiler for parsing markdown without caching or blocking for long periods of time. I use it for reading the content of the Readme and passing it to a webpage. That way the README is readable in a browser through an endpoint.
* **module-alias**: Create aliases of directories and register custom module paths in NodeJS. I use it for avoiding transversal path inside the call, it makes the development way more simpler and cleaner.
* **mongo-uri-builder**: A zero dependency Node.js module to easily create MongoDB connection strings using configuration objects. I use it for passing the uri to mongodb and making the connection with the express server.
* **mongoose**: Mongoose is a MongoDB object modeling tool designed to work in an asynchronous environment. I use it like an ORM and for designing the schema of the app easily.
* **mustache**: Mustache is a logic-less template syntax. It can be used for HTML, config files, source code - anything. It works by expanding tags in a template using values provided in a hash or object. I use it for parsing tags inside the email template and replacing those tags by a value from the app.
* **node-cron**: The node-cron module is tiny task scheduler in pure JavaScript for node.js based on GNU crontab. I use it for managing the calls that need to be execute following a schedule.
* **react**: React is a JavaScript library for creating user interfaces. I use it for creating the user interface for the ERD and documentation.
* **react-dom**: This package serves as the entry point to the DOM and server renderers for React. I use it for managing the interaction in the dom for the voyager.
* **winston**: A logger for just about everything. I use it for saving into a log file any interaction in the server.
* **ava**: AVA is a test runner for Node.js with a concise API, detailed error output, embrace of new language features and process isolation that lets you develop with confidence. I use it for managing effiently the test of the app.
* **coveralls**: Coveralls.io support for Node.js. I use it for linking the app to coveralls website and getting the percentage of coverage of the test.
* **eslint**: ESLint is a tool for identifying and reporting on patterns found in ECMAScript/JavaScript code. In many ways, it is similar to JSLint and JSHint with a few exceptions. I use it for fixing the style of the app.
* **faker**: Generate massive amounts of fake data in the browser and node.js I use it inside the test for generating random data, it make the test more powerful.
* **heml**: HEML is an open source markup language for building responsive email. I use it for building the email template and making responsive email.
* **husky**: Husky is a modern native Git hooks. I use it for restricting the commit to the interesting one and for forcing the test to be run before merging anything.
* **jsdoc**: An API documentation generator for JavaScript. I use it for generating the documentation using the comments in the code.
* **mongo-seeding**: The ultimate solution for populating your MongoDB database. I use it for populating the test database and also for populating the server at first installation.
* **npx**: Executes <command> either from a local node_modules/.bin, or from a central cache, installing any packages needed in order for <command> to run. I use it for running package from my local node module directory such as esLint.
* **nyc**: Istanbul's state of the art command line interface. I use it for creating the report for the coverall and making it available in the browser.
* **@slack/web-api**: For using the web api of Slack (https://api.slack.com/methods)
* **@slack/events-api**: For accessing the event of Slack

#### Environment variables

The environment variables are encoded in the `env` folder with a pass.<br />
*Hint: What is the name of my first cat ?*

```bash
# For encoding the development env file
$ npm run encode
# For decoding the development env file
$ npm run decode
```

#### Adding new request

The mutations, directives and queries are dynamically added to the graph. For adding a new request, you need to follow the logic under :

- Create a new file in **services** inside the folder **directives**, **mutations** or **queries** depending of your need.
- Those files will be automatically added by the file **apollo.js**.
- Add the new request into the directives, mutations or queries types inside the folder **types**.
- Depedning of your need you might need to create a file inside the **dbs** folder.

#### Pre-push

`Husky` has been installed and will prevent to push any code that break the project.

## Seeding

For having a database with some data from the start, you can seed it with a single command. It will fill up all the db with dummy data using `mongo-seed`.

```bash
$ npm run seed
```

## Testing

For automatic tests, I use `Ava`. All the tests can be run with a single command. The command will also provide details on the coverage.

```bash
$ npm run test
```

## Admin

The server have a version of `AdminBro` for managing some of the content. Open a browser and go to the following URL :

```
http://localhost:5000/admin
```

**WARNING** : At February 06 2020, the AdminBro in production create a Teaser error with infinite call. The trick is to modify the `env` production or to force the minify to false in the source code.

## Monitoring

The monitoring is enable by default and can be viewed live on the endpoint `/status` :

```
http://localhost:5000/status
```

## Security

#### Helmet

`Helmet` is automatically installed. It will setup the HTTP header of the app aappropriately and will hide some of them for the hacker. Helmet is not perfect but will help with cross-site scripting attack, clickjacking and some others.

## Running

For running the API, a single command is needed. You might want to use the [SSH Tunneling](#ssh-tunneling).

```bash
$ npm run start
```

## License

MIT - Copyright &copy; [JUSTAL Kevin](https://teamkd.online/)
