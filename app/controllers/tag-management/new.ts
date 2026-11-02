import Controller from '@ember/controller';
import type Tag from 'frontend-reglementaire-bijlage/models/tag';
import { task } from 'ember-concurrency';
import TemplateTagEditModal from 'frontend-reglementaire-bijlage/components/template-tag-edit-modal';
import type Router from 'frontend-reglementaire-bijlage/router';
import type TagManager from 'frontend-reglementaire-bijlage/services/tag-manager';
import { service } from '@ember/service';

export default class TagManagementNewController extends Controller {
  @service declare router: Router;
  @service declare tagManager: TagManager;

  TemplateTagEditModal = TemplateTagEditModal;

  saveTag = task(async (tag: Tag) => {
    await tag.save();
    await this.tagManager.refreshTags();
    this.router.transitionTo('tag-management');
  });
}
