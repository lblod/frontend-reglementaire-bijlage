import Controller from '@ember/controller';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class SnippetManagementIndexController extends Controller {
  @service store;
  @service router;
  @service currentSession;
  queryParams = ['page', 'size', 'label', 'sort'];

  @tracked page = 0;
  @tracked size = 20;
  @tracked label = '';
  @tracked sort = '-created-on';
  @tracked isRemoveModalOpen = false;
  @tracked deletingSnippetList;

  removeSnippetList = task(async () => {
    const snippets = await this.deletingSnippetList.snippets;

    await Promise.all(
      snippets.map(async (snippet) => {
        const editorDocument = await snippet.currentVersion;
        const publishedSnippetVersion =
          await editorDocument.publishedSnippetVersion;

        if (publishedSnippetVersion) {
          publishedSnippetVersion.validThrough = new Date();
          await publishedSnippetVersion.save();
        }

        await snippet.destroyRecord();
      }),
    );

    await this.deletingSnippetList.destroyRecord();
    this.closeRemoveModal();
  });

  @action
  openRemoveModal(snippet) {
    this.deletingSnippetList = snippet;
    this.isRemoveModalOpen = true;
  }

  @action
  closeRemoveModal() {
    this.deletingSnippetList = null;
    this.isRemoveModalOpen = false;
  }
}
