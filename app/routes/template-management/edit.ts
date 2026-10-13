import Route from '@ember/routing/route';
import { service } from '@ember/service';
import type Store from 'frontend-reglementaire-bijlage/services/store';
import type TemplateManagementEditController from 'frontend-reglementaire-bijlage/controllers/template-management/edit';
import type DocumentContainerModel from 'frontend-reglementaire-bijlage/models/document-container';
import type Template from 'frontend-reglementaire-bijlage/models/template';
import type SessionService from 'frontend-reglementaire-bijlage/services/session';
import type { ModelFrom } from 'frontend-reglementaire-bijlage/utils/type-utils';
import { hash } from 'rsvp';
import { getTemplateType } from 'frontend-reglementaire-bijlage/utils/template-type';
import type IntlService from 'ember-intl/services/intl';
import type Tag from 'frontend-reglementaire-bijlage/models/tag';

export default class TemplateManagementEditRoute extends Route {
  @service declare store: Store;
  @service declare session: SessionService;
  @service declare intl: IntlService;
  profile = 'draftDecisionsProfile';

  async model(params: { id: string }) {
    const documentContainer = (await this.store.findRecord(
      'document-container',
      params.id,
      {
        include:
          'current-version,folder,template,tags,template.current-version',
        reload: true,
      },
    )) as DocumentContainerModel;
    const templateContainer = (await documentContainer.template) as
      | Template
      | undefined;
    const templateVersion = await templateContainer?.currentVersion;
    const templateTags = (await documentContainer?.tags) as Tag[] | undefined;
    const templateTypeId = await documentContainer.templateTypeId;

    return hash({
      documentContainer,
      editorDocument: await documentContainer.currentVersion,
      templateType: getTemplateType(templateTypeId, this.intl),
      templateVersion,
      templateTags,
    });
  }

  setupController(
    controller: TemplateManagementEditController,
    model: ModelFrom<this>,
  ) {
    super.setupController(controller, model);

    controller.set('_editorDocument', undefined);
  }
}
