import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ImportUriRoute extends Route {
  @service templateFetcher;
  @service store;

  queryParams = {
    uri: { refreshModel: true },
    endpoint: { refreshModel: true },
  };

  async model(params) {
    const template = await this.templateFetcher.fetchByUri(params);
    await template.loadBody();
    const container = this.store.createRecord('document-container');
    const editorDocument = this.store.createRecord('editor-document', {
      content: template.body,
      title: template.title,
      createdOn: new Date(),
      updatedOn: new Date(),
    });
    console.log(template.body);
    console.log(editorDocument.content);
    container.currentVersion = editorDocument;
    return container;
  }
}
