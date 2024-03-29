# dhis2-gee-app

DHIS2 webapp that extracts values from Google Earth Engine for a given subset of DHIS2 OUs, a certain period and datasets/variables mapping and injects them into DHIS2.

## Setup

```
$ yarn install
```

## Development

Start development server with the admin interface:

```
$ PORT=8082 REACT_APP_DHIS2_BASE_URL="https://play.dhis2.org/dev" yarn start
```

Start development server with the importer interface:

```
$ PORT=8082 REACT_APP_DATA_IMPORTER=true REACT_APP_DHIS2_BASE_URL="https://play.dhis2.org/dev" yarn start
```


Linting:

```
$ yarn lint
```

## Tests

Run unit tests:

```
$ yarn test
```

Run integration tests locally:

```
$ export CYPRESS_DHIS2_AUTH='admin:district'
$ export CYPRESS_EXTERNAL_API="http://localhost:8080"
$ export CYPRESS_ROOT_URL=http://localhost:8081

# non-interactive
$ yarn cy:e2e:run

# interactive UI
$ yarn cy:e2e:open
```

For this to work in Travis CI, you will have to create an environment variable CYPRESS_DHIS2_AUTH (Settings -> Environment Variables) with the password used in your testing DHIS2 instance.

Travis project: https://travis-ci.org/EyeSeeTea/dhis2-gee-app/builds

Cypress Dashboard: https://dashboard.cypress.io/projects/49be3z

## Build app ZIP

This project can generate two app zips.

To generate the admin app:

```
$ yarn build-webapp
```

To generate the importer app:

```
$ yarn build-importer
```

## Some development tips

### Structure

-   `i18n/`: Contains literal translations (gettext format)
-   `public/`: Main app folder with a `index.html`, exposes the APP, contains the feedback-tool
-   `src/pages`: Main React components.
-   `src/components`: Reusable React components.
-   `src/models`: Models that hold all the logic of the app (pages/components only should contain view logic).
-   `src/types`: `.d.ts` file definitions for modules without Typescript definitions.
-   `src/utils`: Misc utilities.
-   `src/locales`: Auto-generated, don't change nor add to version control.
-   `cypress/integration/`: Contains the integration Cypress tests.

### Google Earth Engine

The package [@google/earthengine](https://www.npmjs.com/package/@google/earthengine) does not work when minified in the production create-react-app build. For this reason, instead of importing it directly within the app, we use object `window.ee`, loaded at `public/index.html` (`ee_api_js.js`).

To update `@google/earthengine` to a new version, simply run `yarn add -D @google/earthengine@VERSION`.

### i18n

#### Update an existing language

```
$ yarn update-po
# ... add/edit translations in po files ...
$ yarn localize
```

#### Create a new language

```
$ cp i18n/en.pot i18n/es.po
# ... add translations to i18n/es.po ...
$ yarn localize
```

### App context

File `src/contexts/app-context.ts` holds some general App context so typical infrastructure objects (`api`, `d2`, `currentUser`...) are readily available. Add your own objects if necessary.

```
import { useAppContext } from "./path/to/contexts/app-context";

const SomeComponent: React.FunctionComponent = () => {
    const { d2, api, currentUser } = useAppContext();
    ...
}
```

### Google Earth Engine API unilateral changes warning

**Attention:** GEE API has been reported to change its answer without respecting backwards compatibility with previous versions of its answers. EyeSeetea does not garantee how quick the app will follow GEE API backwards incompatible unilateral changes.
