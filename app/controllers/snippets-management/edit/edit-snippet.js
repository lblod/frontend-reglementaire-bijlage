import Controller from '@ember/controller';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { service } from '@ember/service';
import { tracked } from 'tracked-built-ins';
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
  tableNodes,
  tablePlugin,
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
  bullet_list,
  list_item,
  ordered_list,
} from '@lblod/ember-rdfa-editor/plugins/list';
import { placeholder } from '@lblod/ember-rdfa-editor/plugins/placeholder';
import { heading } from '@lblod/ember-rdfa-editor/plugins/heading';
import { blockquote } from '@lblod/ember-rdfa-editor/plugins/blockquote';
import { code_block } from '@lblod/ember-rdfa-editor/plugins/code';
import { image } from '@lblod/ember-rdfa-editor/plugins/image';
import { inline_rdfa } from '@lblod/ember-rdfa-editor/marks';
import {
  date,
  dateView,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/rdfa-date-plugin/nodes/date';
import { generateTemplate } from '../../../utils/generate-template';
import { getOwner } from '@ember/application';
import { linkPasteHandler } from '@lblod/ember-rdfa-editor/plugins/link';
import { citationPlugin } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/citation-plugin';
import { highlight } from '@lblod/ember-rdfa-editor/plugins/highlight/marks/highlight';
import { color } from '@lblod/ember-rdfa-editor/plugins/color/marks/color';
import { trackedFunction } from 'ember-resources/util/function';
import {
  codelist,
  codelistView,
  number,
  numberView,
  textVariableView,
  text_variable,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/variables';
import { document_title } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/document-title-plugin/nodes';
import { docWithConfig } from '@lblod/ember-rdfa-editor/nodes/doc';

export default class SnippetsManagementEditSnippetController extends Controller {
  @service store;
  @service router;
  @tracked editor;
  @tracked _editorDocument;
  @tracked controller;
  @service intl;
  @service currentSession;
  @tracked citationPlugin = citationPlugin(this.config.citation);
  @service muTask;

  schema = new Schema({
    nodes: {
      doc: docWithConfig({
        content:
          'table_of_contents? document_title? ((chapter|block)+|(title|block)+|(article|block)+)',
      }),
      paragraph,
      document_title,
      repaired_block,

      list_item,
      ordered_list,
      bullet_list,
      placeholder,
      ...tableNodes({ tableGroup: 'block', cellContent: 'inline*' }),
      date: date(this.config.date),
      text_variable,
      number,
      codelist,
      ...STRUCTURE_NODES,
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
        label: 'text',
        component: {
          path: 'variable-plugin/text/insert',
        },
      },
      {
        label: 'number',
        component: {
          path: 'variable-plugin/number/insert',
        },
      },
      {
        label: 'date',
        component: {
          path: 'variable-plugin/date/insert',
        },
      },
      {
        label: 'codelist',
        component: {
          path: 'variable-plugin/codelist/insert',
          options: {
            endpoint: config.insertVariablePlugin.endpoint,
            publisher: this.currentSession.group?.uri,
          },
        },
      },
    ];
  }

  get config() {
    return {
      tableOfContents: [
        {
          nodeHierarchy: [
            'title|chapter|section|subsection|article',
            'structure_header|article_header',
          ],
          scrollContainer: () =>
            document.getElementsByClassName('say-container__main')[0],
        },
      ],
      date: {
        placeholder: {
          insertDate: this.intl.t('date-plugin.insert.date'),
          insertDateTime: this.intl.t('date-plugin.insert.datetime'),
        },
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
      structures: STRUCTURE_SPECS,
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
    };
  }

  get nodeViews() {
    return (controller) => {
      return {
        table_of_contents: tableOfContentsView(this.config.tableOfContents)(
          controller,
        ),
        link: linkView(this.config.link)(controller),
        date: dateView(this.config.date)(controller),
        text_variable: textVariableView(controller),
        number: numberView(controller),
        codelist: codelistView(controller),
      };
    };
  }

  get plugins() {
    return [
      tablePlugin,
      this.citationPlugin,
      linkPasteHandler(this.schema.nodes.link),
    ];
  }

  @action
  handleRdfaEditorInit(editor) {
    this.editor = editor;
    if (this.editorDocument.content) {
      editor.initialize(this.editorDocument.content);
    }
  }

  get dirty() {
    return this.editorDocument.content !== this.editor?.htmlContent;
  }

  currentVersion = trackedFunction(this, async () => {
    return await this.model.documentContainer.currentVersion;
  });

  get editorDocument() {
    return this.currentVersion.value;
  }

  save = task(async () => {
    const html = this.editor.htmlContent;
    const templateVersion = generateTemplate(this.editor);
    const editorDocument = this.store.createRecord('editor-document');
    const currentVersion = this.editorDocument;
    editorDocument.content = html;
    editorDocument.templateVersion = templateVersion;

    editorDocument.createdOn = currentVersion.createdOn;
    editorDocument.updatedOn = new Date();
    editorDocument.title = currentVersion.title;
    editorDocument.previousVersion = currentVersion;
    await editorDocument.save();

    const documentContainer = this.model.documentContainer;
    documentContainer.currentVersion = editorDocument;
    await documentContainer.save();

    const publicationTask = this.store.createRecord(
      'snippet-list-publication-task',
    );
    publicationTask.documentContainer = documentContainer;
    publicationTask.snippetList = this.model.snippetList;
    await publicationTask.save();

    await this.muTask.waitForMuTaskTask.perform(publicationTask.id, 100);
  });

  updateDocumentTitle = task(async () => {
    const documentContainer = this.model.documentContainer;
    const snippetList = this.model.snippetList;

    const publicationTask = this.store.createRecord(
      'snippet-list-publication-task',
    );

    publicationTask.documentContainer = documentContainer;
    publicationTask.snippetList = snippetList;
    await publicationTask.save();

    await this.muTask.waitForMuTaskTask.perform(publicationTask.id, 100);
  });
}
