import Controller from '@ember/controller';
import { task } from 'ember-concurrency';

export default class ImportUriController extends Controller {
  saveTemplate = task(async (event) => {
    console.log('need to make sure to fetch template type first');
    return;
    event.preventDefault();
    await this.editorDocument.save();
    const folder = await this.store.findRecord(
      'editor-document-folder',
      this.templateTypeToCreate.folder,
    );
    this.documentContainer.folder = folder;
    await this.documentContainer.save();
    this.createTemplateModalIsOpen = false;
    this.router.transitionTo(
      'template-management.edit',
      this.documentContainer.id,
    );
  });

}
