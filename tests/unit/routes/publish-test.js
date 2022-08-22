import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | publish', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let route = this.owner.lookup('route:publish');
    assert.ok(route);
  });
});
