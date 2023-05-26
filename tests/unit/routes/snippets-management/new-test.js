import { module, test } from 'qunit';
import { setupTest } from 'frontend-reglementaire-bijlage/tests/helpers';

module('Unit | Route | snippets-management/new', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let route = this.owner.lookup('route:snippets-management/new');
    assert.ok(route);
  });
});
