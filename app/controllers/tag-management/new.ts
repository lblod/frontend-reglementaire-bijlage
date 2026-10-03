import Controller from '@ember/controller';
import type TemplateTag from 'frontend-reglementaire-bijlage/models/template-tag';
import { task } from 'ember-concurrency';
import TemplateTagEditModal from 'frontend-reglementaire-bijlage/components/template-tag-edit-modal'
import type Router from 'frontend-reglementaire-bijlage/router';
import { service } from '@ember/service';

export default class TagManagementNewController extends Controller {
  @service declare router: Router;

  TemplateTagEditModal = TemplateTagEditModal;

  saveTag = task(async (tag: TemplateTag) => {
    await tag.save();
    this.router.transitionTo('tag-management');
  });
}
