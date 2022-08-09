import EmberRouter from '@ember/routing/router';
import config from 'frontend-reglementaire-bijlage/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  this.route('login');
  this.route('mock-login');
  this.route('switch-login');
  this.route('list');
  this.route('edit', { path: '/:id/edit' });

  this.route('legal', function () {
    this.route('disclaimer');
    this.route('cookiestatement');
    this.route('accessibilitystatement');
  });
  this.route('codelists-management', function () {
    this.route('new');
    this.route('edit', { path: '/edit/:id' });
    this.route('codelist', { path: '/:id' });
  });
  this.route('sparql');
});
