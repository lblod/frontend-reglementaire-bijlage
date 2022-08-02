import JSONAPISerializer from '@ember-data/serializer/json-api';
// eslint-disable-next-line ember/no-mixins
import DataTableSerializerMixin from 'ember-data-table/mixins/serializer';

export default class ApplicationSerializer extends JSONAPISerializer.extend(
  DataTableSerializerMixin
) {
  keyForRelationship(key) {
    if (key === 'currentVersion') return 'current-version';
    if (key === 'previousVersion') return 'previous-version';
    return key;
  }
  serializeAttribute(snapshot, json, key, attributes) {
    if (key !== 'uri')
      super.serializeAttribute(snapshot, json, key, attributes);
  }
}
