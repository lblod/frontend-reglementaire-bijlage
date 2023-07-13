import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';

module('Unit | Model | code-list', function (hooks) {
  setupTest(hooks);

  // Specify the other units that are required for this test.
  test('creating a codelist and adding options works', async function (assert) {
    const codeList = run(() =>
      this.owner.lookup('service:store').createRecord('code-list', {}),
    );

    codeList.label = 'a';

    assert.strictEqual(codeList.label, 'a');

    const option = run(() =>
      this.owner.lookup('service:store').createRecord('skos-concept'),
    );

    const options = await codeList.concepts;
    options.pushObject(option);
  });
});
