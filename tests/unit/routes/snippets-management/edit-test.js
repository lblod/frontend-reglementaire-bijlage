import { module, test } from 'qunit';
import { setupTest } from 'frontend-reglementaire-bijlage/tests/helpers';

module('Unit | Route | snippets-management/edit', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let route = this.owner.lookup('route:snippets-management/edit');
    assert.ok(route);
  });
});
