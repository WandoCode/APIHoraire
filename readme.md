## Description
This program is a server API used to store and send informations about users, schedule and worktime for each day of the year.
## Setting up
1. In './config/.env', change the example MongoDB links.
2. In './config/.env', change the example secret key for JWT.
3. npm install
4. npm run serverstart

## Tests
There is one test suite for each main route.

#### Test everythings
- npm run test

#### Specific test
 
- User: npm run test --users.test.js
- Schedule: npm run test --schedule.test.js
- Worktime: npm run test --workTime.test.js

## Modification

#### Validation
Validation chain is wrote in a specific middleware 'validation' that have to be used before controller function.

#### Authentication
The authentication middleware have to be used before controller function
Authentication is made with a local passport.js middelware.
Further authentication for session persistence is made via a JWT passport.js middleware.