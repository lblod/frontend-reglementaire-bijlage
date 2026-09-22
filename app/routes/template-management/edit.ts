import Route from '@ember/routing/route';
import { service } from '@ember/service';
import type Store from 'frontend-reglementaire-bijlage/services/store';
import type TemplateManagementEditController from 'frontend-reglementaire-bijlage/controllers/template-management/edit';
import type DocumentContainerModel from 'frontend-reglementaire-bijlage/models/document-container';
import type EditorDocumentModel from 'frontend-reglementaire-bijlage/models/editor-document';
import type Template from 'frontend-reglementaire-bijlage/models/template';
import type TemplateVersion from 'frontend-reglementaire-bijlage/models/template-version';
import type SessionService from 'frontend-reglementaire-bijlage/services/session';
import type { ModelFrom } from 'frontend-reglementaire-bijlage/utils/type-utils';
import { hash } from 'rsvp';
import {
  getTemplateType,
  getTemplateTypes,
} from 'frontend-reglementaire-bijlage/utils/template-type';
import type IntlService from 'ember-intl/services/intl';
import type TemplateTag from 'frontend-reglementaire-bijlage/models/template-tag';

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
        include: 'current-version,folder',
        reload: true,
      },
    )) as DocumentContainerModel;
    const templates: Template[] = (
      await this.store.query('template', {
        filter: {
          'derived-from': {
            id: documentContainer.id,
          },
        },
        // See template-management/index.js for details of this hack
        avoid_cache: new Date().toISOString(),
        include: 'current-version,tags',
      })
    ).slice() as Template[];
    const templateVersion = templates[0]?.currentVersion as
      | TemplateVersion
      | undefined;
    const templateTags = await templates[0]?.tags;
    const templateTypeId = await documentContainer.templateTypeId;

    return hash({
      documentContainer,
      editorDocument: documentContainer.currentVersion as EditorDocumentModel,
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
