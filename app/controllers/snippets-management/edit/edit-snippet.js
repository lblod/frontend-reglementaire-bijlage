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
  variable,
  variableView,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/nodes';
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
import { document_title } from '../../../utils/editor-nodes';
import { generateTemplate } from '../../../utils/generate-template';
import { getOwner } from '@ember/application';
import { linkPasteHandler } from '@lblod/ember-rdfa-editor/plugins/link';
import { citationPlugin } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/citation-plugin';
import { highlight } from '@lblod/ember-rdfa-editor/plugins/highlight/marks/highlight';
import { color } from '@lblod/ember-rdfa-editor/plugins/color/marks/color';
import { trackedFunction } from 'ember-resources/util/function';

export default class SnippetsManagementEditSnippetController extends Controller {
  @service store;
  @service router;
  @tracked editor;
  @tracked _editorDocument;
  @tracked controller;
  @service intl;
  @service currentSession;
  @tracked citationPlugin = citationPlugin(this.config.citation);

  schema = new Schema({
    nodes: {
      doc: {
        content:
          'table_of_contents? document_title? ((chapter|block)+|(title|block)+|(article|block)+)',
      },
      paragraph,
      document_title,
      repaired_block,

      list_item,
      ordered_list,
      bullet_list,
      placeholder,
      ...tableNodes({ tableGroup: 'block', cellContent: 'inline*' }),
      date: date(this.config.date),
      variable,
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

  get insertVariableWidgetOptions() {
    const config = getOwner(this).resolveRegistration('config:environment');
    return {
      publisher: this.currentSession.group.uri,
      defaultEndpoint: config.insertVariablePlugin.endpoint,
      variableTypes: ['text', 'number', 'date', 'codelist'],
    };
  }

  get config() {
    const ENV = getOwner(this).resolveRegistration('config:environment');
    return {
      tableOfContents: [
        {
          nodeHierarchy: [
            'title|chapter|section|subsection|article',
            'structure_header|article_header',
          ],
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
      variable: {
        publisher: this.currentSession.group?.uri,
        defaultEndpoint: ENV.insertVariablePlugin.endpoint,
        variableTypes: ['text', 'number', 'date', 'codelist'],
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
        variable: variableView(controller),
        table_of_contents: tableOfContentsView(this.config.tableOfContents)(
          controller
        ),
        link: linkView(this.config.link)(controller),
        date: dateView(this.config.date)(controller),
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
      editor.setHtmlContent(this.editorDocument.content);
    }
  }

  get dirty() {
    return this.editorDocument.content !== this.editor?.htmlContent;
  }

  currentVersion = trackedFunction(this, async () => {
    return await this.model.currentVersion;
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

    const documentContainer = this.model;
    documentContainer.currentVersion = editorDocument;
    await documentContainer.save();
  });
}
