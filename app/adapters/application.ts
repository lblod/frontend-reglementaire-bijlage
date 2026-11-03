import JSONAPIAdapter from '@ember-data/adapter/json-api';
import type { QueryState } from '@ember-data/adapter/rest';
import type { AdapterPayload } from '@ember-data/legacy-compat';
import type { Snapshot } from '@ember-data/legacy-compat/legacy-network-handler/snapshot';
import type { SnapshotRecordArray } from '@ember-data/legacy-compat/legacy-network-handler/snapshot-record-array';
import type { ModelSchema } from '@ember-data/store/types';
import type Store from 'frontend-reglementaire-bijlage/services/store';

export default class ApplicationAdapter extends JSONAPIAdapter {
  // Copy fix for includes in queries from here: https://github.com/emberjs/data/issues/9588
  override query(
    store: Store,
    type: ModelSchema,
    query: Record<string, unknown>,
  ): Promise<AdapterPayload> {
    const { include } = query;
    const normalizedInclude = Array.isArray(include)
      ? include.map(convertToKebabCase).join(',')
      : include;
    if (normalizedInclude) {
      query['include'] = normalizedInclude;
    }

    return super.query(store, type, query);
  }
  override buildQuery(snapshot: Snapshot | SnapshotRecordArray): QueryState {
    const { include } = snapshot;
    const normalizedInclude = Array.isArray(include)
      ? include.map(convertToKebabCase).join(',')
      : include;
    if (normalizedInclude) {
      snapshot['include'] = normalizedInclude;
    }
    return super.buildQuery(snapshot);
  }
}

function convertToKebabCase(camelCase: string) {
  return camelCase.replace(
    /[A-Z]+(?![a-z])|[A-Z]/g,
    ($, ofs) => (ofs ? '-' : '') + $.toLowerCase(),
  );
}
