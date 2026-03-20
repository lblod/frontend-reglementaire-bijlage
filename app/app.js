import Application from '@ember/application';
import Resolver from 'ember-resolver';
import loadInitializers from 'ember-load-initializers';
import environment from 'frontend-reglementaire-bijlage/config/environment';
import '@glint/environment-ember-loose';

/**
 * @typedef {import('ember-source/types')} EmberTypes
 */

export default class App extends Application {
  modulePrefix = environment.modulePrefix;
  podModulePrefix = environment.podModulePrefix;
  Resolver = Resolver;
}

loadInitializers(App, environment.modulePrefix);
