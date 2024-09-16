import { collateImportedResources } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin/utils/collate-imported-resources';
import { Snippet } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin';

/**
 * Update the collected imported resources on a snippet list by looking at each of the snippet
 * documents
 * @param {SnippetList} list - The list to update
 */
export async function saveCollatedImportedResources(list) {
  const snippetModels = await Promise.all(
    (await list.snippets).map((snip) => snip.currentVersion),
  );
  const snippets = snippetModels.map(
    (model) =>
      new Snippet({
        title: model.title,
        content: model.content,
        createdOn: model.createdOn.toISOString(),
      }),
  );
  const importedResources = collateImportedResources(snippets);
  list.importedResources = importedResources;

  return list.save();
}
