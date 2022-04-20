# Basique API configuration

## Conposants

- DB connexion with mongoose and MongoDB
- Authentication with JWT and passport
- CORS protection (to be configured)
- Form validation with express-validator: custom middleware

## Configuration

1° Change the name (=<APP_NAME>) of your app in npm script for debug: "set DEBUG=<APP_NAME>:\* & npm start"
2° Configure CORS module
3° Configure local strategy for passport
4° Add routes to ./routes
5° Add function for those routes to ./controllers
6° If necessary, add form validation to ./middleware/validation and used it in the route definition

## Test

- One test file by model
- Change the DB name when you create a new testing file.
