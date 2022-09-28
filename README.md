# frontend-reglementaire-bijlage

The frontend for the reglementaire bijlage app, which is a management interface for regulatory attachments for the Flemish government.

## Configuration
The following environment variables should be set:
```
- EMBER_VARIABLE_PLUGIN_ENDPOINT: the endpoint containing codelists, in the regulatory statements app this is likely just `/raw-sparql`
```
## Prerequisites

You will need the following things properly installed on your computer.

* [Git](https://git-scm.com/)
* [Node.js](https://nodejs.org/) (with npm)
* [Ember CLI](https://ember-cli.com/)
* [Google Chrome](https://google.com/chrome/)

## Installation

* `git clone <repository-url>` this repository
* `cd frontend-reglementaire-bijlage`
* `npm install`

## Running / Development

* `ember serve`
* Visit your app at [http://localhost:4200](http://localhost:4200).
* Visit your tests at [http://localhost:4200/tests](http://localhost:4200/tests).

### Code Generators

Make use of the many generators for code, try `ember help generate` for more details

### Running Tests

* `ember test`
* `ember test --server`

### Linting

* `npm run lint`
* `npm run lint:fix`

### Building

* `ember build` (development)
* `ember build --environment production` (production)

### Releasing

Make sure all PRs have proper labels, and then use

* `npm run release`


