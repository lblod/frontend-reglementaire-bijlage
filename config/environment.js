'use strict';

module.exports = function (environment) {
  let ENV = {
    modulePrefix: 'frontend-reglementaire-bijlage',
    environment,
    rootURL: '/',
    locationType: 'auto',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. EMBER_NATIVE_DECORATOR_SUPPORT: true
      },
      EXTEND_PROTOTYPES: {
        // Prevent Ember Data from overriding Date.parse.
        Date: false,
      },
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    },
    torii: {
      disableRedirectInitializer: true,
      providers: {
        'acmidm-oauth2': {
          apiKey: '{{OAUTH_API_KEY}}',
          baseUrl: '{{OAUTH_API_BASE_URL}}',
          scope: '{{OAUTH_API_SCOPE}}',
          redirectUri: '{{OAUTH_API_REDIRECT_URL}}',
          logoutUrl: '{{OAUTH_API_LOGOUT_URL}}',
          returnUrl: '{{OAUTH_API_RETURN_URL}}',
        },
      },
    },
    environmentName: '{{ENVIRONMENT_NAME}}',
    insertVariablePlugin: {
      endpoint: '{{VARIABLE_PLUGIN_ENDPOINT}}',
    },
  };

  if (environment === 'development') {
    ENV.insertVariablePlugin.endpoint = '/raw-sparql';
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
    ENV.APP.autoboot = false;
  }

  if (environment === 'production') {
    // here you can enable a production-specific feature
  }

  return ENV;
};
