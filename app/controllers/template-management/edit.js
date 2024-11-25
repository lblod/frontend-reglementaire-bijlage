import Controller from '@ember/controller';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { service } from '@ember/service';
import { tracked } from 'tracked-built-ins';
import { trackedFunction } from 'reactiveweb/function';
import { Schema } from '@lblod/ember-rdfa-editor';
import { v4 as uuid } from 'uuid';
import {
  em,
  strikethrough,
  strong,
  underline,
  subscript,
  superscript,
} from '@lblod/ember-rdfa-editor/plugins/text-style';
import {
  blockRdfaWithConfig,
  hard_break,
  horizontal_rule,
  invisibleRdfaWithConfig,
  paragraph,
  repairedBlockWithConfig,
  text,
} from '@lblod/ember-rdfa-editor/nodes';
import { BlockRDFaView } from '@lblod/ember-rdfa-editor/nodes/block-rdfa';
import {
  tableKeymap,
  tableNodes,
  tablePlugins,
} from '@lblod/ember-rdfa-editor/plugins/table';
import { link, linkView } from '@lblod/ember-rdfa-editor/nodes/link';
import {
  inlineRdfaWithConfigView,
  inlineRdfaWithConfig,
} from '@lblod/ember-rdfa-editor/nodes/inline-rdfa';
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
import { headingWithConfig } from '@lblod/ember-rdfa-editor/plugins/heading';
import { blockquote } from '@lblod/ember-rdfa-editor/plugins/blockquote';
import { code_block } from '@lblod/ember-rdfa-editor/plugins/code';
import { image } from '@lblod/ember-rdfa-editor/plugins/image';
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
  personVariableView,
  person_variable,
  autofilled_variable,
  autofilledVariableView,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/variables';
import { document_title } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/document-title-plugin/nodes';
import {
  templateComment,
  templateCommentView,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/template-comments-plugin';
import { docWithConfig } from '@lblod/ember-rdfa-editor/nodes/doc';
import { undo } from '@lblod/ember-rdfa-editor/plugins/history';
import { roadsign_regulation } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/roadsign-regulation-plugin/nodes';
import TextVariableInsertComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/text/insert';
import PersonVariableInsertComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/person/insert';
import NumberInsertComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/number/insert';
import DateInsertVariableComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/date/insert-variable';
import CodelistInsertComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/codelist/insert';
import VariablePluginAddressInsertVariableComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/address/insert-variable';
import SnippetInsertRdfaComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/snippet-plugin/snippet-insert-rdfa';
import AutofilledInsertComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/autofilled/insert';
import {
  DECISION_STANDARD_FOLDER,
  IVGR_TAGS,
  RMW_TAGS,
} from '../../utils/constants';
import {
  editableNodePlugin,
  getActiveEditableNode,
} from '@lblod/ember-rdfa-editor/plugins/_private/editable-node';
import AttributeEditor from '@lblod/ember-rdfa-editor/components/_private/attribute-editor';
import RdfaEditor from '@lblod/ember-rdfa-editor/components/_private/rdfa-editor';
import DebugInfo from '@lblod/ember-rdfa-editor/components/_private/debug-info';
import SnippetListSelectRdfaComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/snippet-plugin/snippet-list-select-rdfa';
import {
  snippetPlaceholder,
  snippetPlaceholderView,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin/nodes/snippet-placeholder';
import {
  snippet,
  snippetView,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin/nodes/snippet';
import {
  structure,
  structureView,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/structure-plugin/node';
import StructureControl from '@lblod/ember-rdfa-editor-lblod-plugins/components/structure-plugin/_private/control-card';
import StructureInsert from '@lblod/ember-rdfa-editor-lblod-plugins/components/decision-plugin/insert-article';
import {
  mandatee_table,
  mandateeTableView,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/mandatee-table-plugin/node';

import {
  osloLocation,
  osloLocationView,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/location-plugin/node';
import { variableAutofillerPlugin } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/plugins/autofiller';
import { extractSnippetListUris } from '../../utils/extract-snippet-lists';

const SNIPPET_LISTS_IDS_DOCUMENT_ATTRIBUTE = 'data-snippet-list-ids';
const GEMEENTE_CLASSIFICATION_URI =
  'http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/5ab0e9b8a3b2ca7c5e000001';

export default class TemplateManagementEditController extends Controller {
  @service store;
  @service router;
  @tracked editor;
  @tracked _editorDocument;
  @service intl;
  @service currentSession;
  @tracked citationPlugin = citationPlugin(this.config.citation);
  @tracked assignedSnippetListsIds = [];
  AttributeEditor = AttributeEditor;
  RdfaEditor = RdfaEditor;
  DebugInfo = DebugInfo;
  SnippetListSelect = SnippetListSelectRdfaComponent;
  SnippetInsert = SnippetInsertRdfaComponent;
  StructureInsert = StructureInsert;
  StructureControl = StructureControl;
  schema = new Schema({
    nodes: {
      doc: docWithConfig({
        content:
          'table_of_contents? document_title? ((block|chapter)+|(block|title)+|(block|article)+)',

        extraAttributes: {
          [SNIPPET_LISTS_IDS_DOCUMENT_ATTRIBUTE]: { default: null },
        },
        rdfaAware: true,
      }),
      paragraph,
      structure,
      document_title,
      repaired_block: repairedBlockWithConfig({ rdfaAware: true }),

      list_item: listItemWithConfig({
        enableHierarchicalList: true,
      }),
      ordered_list: orderedListWithConfig({
        enableHierarchicalList: true,
      }),
      bullet_list: bulletListWithConfig({
        enableHierarchicalList: true,
      }),
      templateComment,
      placeholder,
      ...tableNodes({
        tableGroup: 'block',
        cellContent: 'block+',
      }),
      address,
      date: date(this.config.date),
      text_variable,
      oslo_location: osloLocation(this.config.location),
      person_variable,
      autofilled_variable,
      number,
      codelist,
      ...STRUCTURE_NODES,
      roadsign_regulation,
      mandatee_table,

      heading: headingWithConfig({ rdfaAware: false }),
      blockquote,

      horizontal_rule,
      code_block,

      text,

      image,

      inline_rdfa: inlineRdfaWithConfig({ rdfaAware: true }),
      hard_break,
      block_rdfa: blockRdfaWithConfig({ rdfaAware: true }),
      table_of_contents: table_of_contents(this.config.tableOfContents),
      invisible_rdfa: invisibleRdfaWithConfig({ rdfaAware: true }),
      link: link(this.config.link),
      snippet_placeholder: snippetPlaceholder(this.config.snippet),
      snippet: snippet(this.config.snippet),
    },
    marks: {
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
      {
        label: this.intl.t('editor.variables.person'),
        component: PersonVariableInsertComponent,
      },
      {
        label: 'autofilled',
        component: AutofilledInsertComponent,
      },
    ];
  }

  get supportsTables() {
    return (
      this.editor && this.editor.activeEditorState.schema.nodes['table_cell']
    );
  }
  get supportsComments() {
    return (
      this.editor &&
      this.editor.activeEditorState.schema.nodes['templateComment']
    );
  }
  get config() {
    const env = getOwner(this).resolveRegistration('config:environment');
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
      structures: this.internalTypeName === 'decision' ? [] : STRUCTURE_SPECS,
      citation: {
        type: 'nodes',
        activeInNodeTypes(schema) {
          return new Set([schema.nodes.doc]);
        },
        endpoint: '/codex/sparql',
      },
      link: {
        interactive: true,
        rdfaAware: true,
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
        classificatieUri: GEMEENTE_CLASSIFICATION_URI,
      },
      lmb: {
        endpoint: '/vendor-proxy/query',
      },
      mandateeTable: {
        tags: [...IVGR_TAGS, ...RMW_TAGS],
        defaultTag: IVGR_TAGS[0],
      },

      location: {
        defaultPointUriRoot:
          'https://publicatie.gelinkt-notuleren.vlaanderen.be/id/geometrie/',
        defaultPlaceUriRoot:
          'https://publicatie.gelinkt-notuleren.vlaanderen.be/id/plaats/',
        defaultAddressUriRoot:
          'https://publicatie.gelinkt-notuleren.vlaanderen.be/id/adres/',
      },
      autofilledVariable: {
        autofilledValues: {},
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
        oslo_location: osloLocationView(this.config.location)(controller),
        templateComment: templateCommentView(controller),
        person_variable: personVariableView(controller),
        inline_rdfa: inlineRdfaWithConfigView({ rdfaAware: true })(controller),
        block_rdfa: (node) => new BlockRDFaView(node),
        snippet_placeholder: snippetPlaceholderView(this.config.snippet)(
          controller,
        ),
        mandatee_table: mandateeTableView(controller),
        structure: structureView(controller),
        snippet: snippetView(this.config.snippet)(controller),
        autofilled_variable: autofilledVariableView(controller),
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
      editableNodePlugin(),
      variableAutofillerPlugin(this.config.autofilledVariable),
    ];
  }
  get activeNode() {
    if (this.editor) {
      return getActiveEditableNode(this.editor.activeEditorState);
    }
    return null;
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
      editor.initialize(this.editorDocument.content, { doNotClean: true });
      this.assignedSnippetListsIds = this.documentSnippetListIds;
    } else if (this.model?.templateTypeId === DECISION_STANDARD_FOLDER) {
      // This is a decision with no content, so we need to insert a decision (besluit) node so that
      // any of the decision-based plugins work
      const decisionNodeType = this.editor.schema.nodes['block_rdfa'];
      if (decisionNodeType) {
        /** @type {import('@lblod/ember-rdfa-editor/core/rdfa-processor').OutgoingTriple[]} */
        const outgoingProps = [
          {
            predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
            object: {
              termType: 'NamedNode',
              value: 'http://data.vlaanderen.be/ns/besluit#Besluit',
            },
          },
        ];
        const decisionUuid = uuid();
        const decisionNode = decisionNodeType.create(
          {
            subject: `http://data.lblod.info/id/besluiten/--ref-uuid4-${decisionUuid}`,
            properties: outgoingProps,
            rdfaNodeType: 'resource',
          },
          this.editor.schema.nodes['paragraph'].create(),
        );
        this.editor.withTransaction(
          (tr) => tr.replaceSelectionWith(decisionNode),
          { view: this.editor.mainEditorView },
        );
      }
    } else {
      const docId = uuid();
      editor.initialize(
        `<div data-say-document="true" resource="http://example.net/id/reglement/--ref-uuid4-${docId}" typeof="ext:Reglement"></div>`,
      );
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
      {
        queryParams: {
          overrideConfirm: true,
        },
      },
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

    const snippetListUris = extractSnippetListUris(html);
    const snippetListObjects = await Promise.all(
      snippetListUris.map((uri) => this.store.findByUri('snippet-list', uri)),
    );
    documentContainer.linkedSnippetLists = snippetListObjects;
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
}
