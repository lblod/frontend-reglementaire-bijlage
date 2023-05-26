import { module, test } from 'qunit';
import { setupTest } from 'frontend-reglementaire-bijlage/tests/helpers';

module(
  'Unit | Controller | snippets-management/edit-snippet',
  function (hooks) {
    setupTest(hooks);

    // TODO: Replace this with your real tests.
    test('it exists', function (assert) {
      let controller = this.owner.lookup(
        'controller:snippets-management/edit-snippet'
      );
      assert.ok(controller);
    });
  }
);
