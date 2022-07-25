import EmberRouter from '@ember/routing/router';
import config from 'frontend-reglementaire-bijlage/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  this.route('login');
  this.route('mock-login');
  this.route('list');
  this.route('edit', { path: '/:id/edit' });

  this.route('legal', function () {
    this.route('disclaimer');
    this.route('cookiestatement');
    this.route('accessibilitystatement');
  });
});
