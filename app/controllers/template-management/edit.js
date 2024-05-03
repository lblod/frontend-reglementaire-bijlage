import Controller from '@ember/controller';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { service } from '@ember/service';
import { tracked } from 'tracked-built-ins';
import { trackedFunction } from 'ember-resources/util/function';
import { Schema } from '@lblod/ember-rdfa-editor';
import {
  em,
  strikethrough,
  strong,
  underline,
  subscript,
  superscript,
} from '@lblod/ember-rdfa-editor/plugins/text-style';
import {
  block_rdfa,
  hard_break,
  horizontal_rule,
  invisible_rdfa,
  paragraph,
  repaired_block,
  text,
} from '@lblod/ember-rdfa-editor/nodes';
import {
  tableKeymap,
  tableNodes,
  tablePlugins,
} from '@lblod/ember-rdfa-editor/plugins/table';
import { link, linkView } from '@lblod/ember-rdfa-editor/nodes/link';
import {
  tableOfContentsView,
  table_of_contents,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/table-of-contents-plugin/nodes';
import {
  STRUCTURE_NODES,
  STRUCTURE_SPECS,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/article-structure-plugin/structures';
import {
  bulletListWithConfig,
  listItemWithConfig,
  listTrackingPlugin,
  orderedListWithConfig,
} from '@lblod/ember-rdfa-editor/plugins/list';
import { placeholder } from '@lblod/ember-rdfa-editor/plugins/placeholder';
import { heading } from '@lblod/ember-rdfa-editor/plugins/heading';
import { blockquote } from '@lblod/ember-rdfa-editor/plugins/blockquote';
import { code_block } from '@lblod/ember-rdfa-editor/plugins/code';
import { image } from '@lblod/ember-rdfa-editor/plugins/image';
import { inline_rdfa } from '@lblod/ember-rdfa-editor/marks';
import { generateTemplate } from '../../utils/generate-template';
import { getOwner } from '@ember/application';
import { linkPasteHandler } from '@lblod/ember-rdfa-editor/plugins/link';
import { citationPlugin } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/citation-plugin';
import { highlight } from '@lblod/ember-rdfa-editor/plugins/highlight/marks/highlight';
import { color } from '@lblod/ember-rdfa-editor/plugins/color/marks/color';
import {
  address,
  addressView,
  codelist,
  codelistView,
  date,
  dateView,
  number,
  numberView,
  textVariableView,
  text_variable,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/variables';
import { document_title } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/document-title-plugin/nodes';
import {
  templateComment,
  templateCommentView,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/template-comments-plugin';
import { docWithConfig } from '@lblod/ember-rdfa-editor/nodes/doc';
import { undo } from '@lblod/ember-rdfa-editor/plugins/history';
import {
  besluitNodes,
  structureSpecs as decisionStructureSpecs,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/standard-template-plugin';
import { roadsign_regulation } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/roadsign-regulation-plugin/nodes';
import TextVariableInsertComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/text/insert';
import NumberInsertComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/number/insert';
import DateInsertVariableComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/date/insert-variable';
import CodelistInsertComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/codelist/insert';
import VariablePluginAddressInsertVariableComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/address/insert-variable';
import { DECISION_STANDARD_FOLDER } from '../../utils/constants';

const SNIPPET_LISTS_IDS_DOCUMENT_ATTRIBUTE = 'data-snippet-list-ids';

export default class TemplateManagementEditController extends Controller {
  @service store;
  @service router;
  @tracked editor;
  @tracked _editorDocument;
  @service intl;
  @service currentSession;
  @tracked citationPlugin = citationPlugin(this.config.citation);
  @tracked assignedSnippetListsIds = [];

  schema = new Schema({
    nodes: {
      doc: docWithConfig({
        content:
          'table_of_contents? document_title? ((chapter|block)+|(title|block)+|(article|block)+)',
        extraAttributes: {
          [SNIPPET_LISTS_IDS_DOCUMENT_ATTRIBUTE]: { default: null },
        },
      }),
      paragraph,
      document_title,
      repaired_block,

      list_item: listItemWithConfig({ enableHierarchicalList: true }),
      ordered_list: orderedListWithConfig({ enableHierarchicalList: true }),
      bullet_list: bulletListWithConfig({ enableHierarchicalList: true }),
      templateComment,
      placeholder,
      ...tableNodes({ tableGroup: 'block', cellContent: 'block+' }),
      address,
      date: date(this.config.date),
      text_variable,
      number,
      codelist,
      ...STRUCTURE_NODES,
      ...besluitNodes,
      roadsign_regulation,

      heading,
      blockquote,

      horizontal_rule,
      code_block,

      text,

      image,

      hard_break,
      block_rdfa,
      table_of_contents: table_of_contents(this.config.tableOfContents),
      invisible_rdfa,
      link: link(this.config.link),
    },
    marks: {
      inline_rdfa,
      em,
      strong,
      underline,
      strikethrough,
      subscript,
      superscript,
      highlight,
      color,
    },
  });

  get variableTypes() {
    const config = getOwner(this).resolveRegistration('config:environment');
    return [
      {
        label: this.intl.t('editor.variables.text'),
        component: TextVariableInsertComponent,
      },
      {
        label: this.intl.t('editor.variables.number'),
        component: NumberInsertComponent,
      },
      {
        label: this.intl.t('editor.variables.address'),
        component: VariablePluginAddressInsertVariableComponent,
      },
      {
        label: this.intl.t('editor.variables.date'),
        component: DateInsertVariableComponent,
      },
      {
        label: this.intl.t('editor.variables.codelist'),
        component: CodelistInsertComponent,
        options: {
          endpoint: config.insertVariablePlugin.endpoint,
          publisher: this.currentSession.group?.uri,
        },
      },
    ];
  }

  get config() {
    const env = getOwner(this).resolveRegistration('config:environment');
    const classification = this.currentSession.classification;
    return {
      tableOfContents: [
        {
          nodeHierarchy: [
            'title|chapter|section|subsection|article',
            'structure_header|article_header',
          ],
          scrollContainer: () =>
            document.getElementsByClassName('say-container__main')[0],
          scrollingPadding: 300,
        },
      ],
      date: {
        formats: [
          {
            label: 'Short Date',
            key: 'short',
            dateFormat: 'dd/MM/yy',
            dateTimeFormat: 'dd/MM/yy HH:mm',
          },
          {
            label: 'Long Date',
            key: 'long',
            dateFormat: 'EEEE dd MMMM yyyy',
            dateTimeFormat: 'PPPPp',
          },
        ],
        allowCustomFormat: true,
      },
      structures:
        this.internalTypeName === 'decision'
          ? decisionStructureSpecs
          : STRUCTURE_SPECS,
      citation: {
        type: 'nodes',
        activeInNodeTypes(schema) {
          return new Set([schema.nodes.doc]);
        },
        endpoint: '/codex/sparql',
      },
      link: {
        interactive: true,
      },
      snippet: {
        endpoint: '/raw-sparql',
      },
      roadsignRegulation: {
        endpoint: env.mowRegistryEndpoint,
        imageBaseUrl: env.roadsignImageBaseUrl,
      },
      decisionType: {
        endpoint: 'https://centrale-vindplaats.lblod.info/sparql',
        classificatieUri: classification?.uri,
      },
    };
  }

  get nodeViews() {
    return (controller) => {
      return {
        table_of_contents: tableOfContentsView(this.config.tableOfContents)(
          controller,
        ),
        link: linkView(this.config.link)(controller),
        address: addressView(controller),
        date: dateView(this.config.date)(controller),
        number: numberView(controller),
        text_variable: textVariableView(controller),
        codelist: codelistView(controller),
        templateComment: templateCommentView(controller),
      };
    };
  }

  get plugins() {
    return [
      ...tablePlugins,
      tableKeymap,
      this.citationPlugin,
      linkPasteHandler(this.schema.nodes.link),
      listTrackingPlugin(),
    ];
  }

  /** @returns {'decision', 'regulatory-attachment'} - the internal name for the template type */
  get internalTypeName() {
    return this.model?.templateTypeId === DECISION_STANDARD_FOLDER
      ? 'decision'
      : 'regulatory-attachment';
  }

  @action
  handleRdfaEditorInit(editor) {
    this.editor = editor;
    if (this.editorDocument.content) {
      editor.initialize(this.editorDocument.content);
      this.assignedSnippetListsIds = this.documentSnippetListIds;
    } else if (this.model?.templateTypeId === DECISION_STANDARD_FOLDER) {
      // This is a decision with no content, so we need to insert a decision (besluit) node so that
      // any of the decision-based plugins work
      const decisionNodeType = this.editor.schema.nodes['besluit'];
      if (decisionNodeType) {
        const decisionNode = decisionNodeType.create(
          // This should just be needed for 'legacy' rdfa
          { resource: '' },
          this.editor.schema.nodes['paragraph'].create(),
        );
        this.editor.withTransaction(
          (tr) => tr.replaceSelectionWith(decisionNode),
          { view: this.editor.mainEditorView },
        );
      }
    }
  }

  isPublished = trackedFunction(this, async () => {
    const publishedTemplate = await this.store.query('template-version', {
      filter: {
        'derived-from': {
          id: this.editorDocument.id,
        },
      },
    })[0];
    return Boolean(publishedTemplate);
  });

  get dirty() {
    // Since we clear the undo history when saving, this works. If we want to maintain undo history
    // on save, we would need to add functionality to the editor to track what is the 'saved' state
    return this.editor?.checkCommand(undo, {
      view: this.editor?.mainEditorView,
    });
  }

  get editorDocument() {
    return this._editorDocument || this.model.editorDocument;
  }

  publish = task(async () => {
    await this.save.perform();
    this.router.transitionTo(
      'template-management.publish',
      this.model.documentContainer.id,
    );
  });

  save = task(async () => {
    const html = this.editor.htmlContent;
    const templateVersion = generateTemplate(this.editor);
    const editorDocument = this.store.createRecord('editor-document');
    editorDocument.content = html;
    editorDocument.templateVersion = templateVersion;
    editorDocument.createdOn = this.model.editorDocument.createdOn;
    editorDocument.updatedOn = new Date();
    editorDocument.title = this.model.editorDocument.title;
    editorDocument.previousVersion = this.model.editorDocument;
    await editorDocument.save();

    const documentContainer = this.model.documentContainer;
    documentContainer.currentVersion = editorDocument;
    await documentContainer.save();
    this._editorDocument = editorDocument;
  });

  get documentSnippetListIds() {
    return (
      this.editor
        .getDocumentAttribute(SNIPPET_LISTS_IDS_DOCUMENT_ATTRIBUTE)
        ?.split(',')
        .filter(Boolean) ?? []
    );
  }

  set documentSnippetListIds(snippetIds) {
    this.editor.setDocumentAttribute(
      SNIPPET_LISTS_IDS_DOCUMENT_ATTRIBUTE,
      snippetIds.join(','),
    );
    this.assignedSnippetListsIds = snippetIds;
  }

  setDocumentContainerSnippetLists = task(async (snippetIds) => {
    if (!snippetIds || !snippetIds.length) {
      this.documentSnippetListIds = [];
      this.model.documentContainer.snippetLists.setObjects([]);

      return this.save.perform();
    }

    const snippetLists = await this.store.query('snippet-list', {
      filter: {
        ':id:': snippetIds.join(','),
      },
      include: 'snippets',
    });

    this.documentSnippetListIds = snippetIds;
    this.model.documentContainer.snippetLists.setObjects(snippetLists);

    return this.save.perform();
  });
}
