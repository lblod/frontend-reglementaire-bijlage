import type Controller from '@ember/controller';
import Route from '@ember/routing/route';
import type Transition from '@ember/routing/transition';
import { service } from '@ember/service';
import type Store from 'frontend-reglementaire-bijlage/services/store';
import type SnippetList from 'frontend-reglementaire-bijlage/models/snippet-list';
import type TemplateTag from 'frontend-reglementaire-bijlage/models/template-tag';

export default class TagManagementEditRoute extends Route {
  @service declare store: Store;

  async model(params: { id: string }) {
    return (await this.store.findRecord(
      'template-tag',
      params.id,
      {},
    )) as TemplateTag;
  }
}
