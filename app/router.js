import EmberRouter from '@ember/routing/router';
import config from 'frontend-reglementaire-bijlage/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  this.route('login');
  this.route('mock-login');
  this.route('legal', function () {
    this.route('disclaimer');
    this.route('cookiestatement');
    this.route('accessibilitystatement');
  });
  this.route('template-management', function () {
    this.route('edit', { path: '/:id/edit' });
    this.route('publish', { path: '/:id/publish' });
  });
  this.route('codelist-management', function () {
    this.route('new');
    this.route('edit', { path: '/:id/edit' });
  });
  this.route('sparql');
  this.route('authorization', function () {
    this.route('callback');
  });
  this.route('snippet-management', function () {
    this.route('new');
    this.route('edit', { path: '/:id/edit' }, function () {
      this.route('edit-snippet', { path: '/:snippet_id/edit-snippet' });
    });
  });
  this.route('import', function () {
    this.route('uri');
  });
});
