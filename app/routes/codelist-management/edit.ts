import type Store from '@ember-data/store';
import Route from '@ember/routing/route';
import { service } from '@ember/service';
import CodeListModel from 'frontend-reglementaire-bijlage/models/code-list';

export default class CodelistManagementEditRoute extends Route {
  @service declare store: Store;

  async model(params: { id: string }) {
    const codelist = await this.store.findRecord<CodeListModel>(
      'code-list',
      params.id,
    );
    const concepts = await codelist.concepts;

    return {
      codelist,
      concepts,
    };
  }
}
