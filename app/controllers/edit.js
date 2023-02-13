import Controller from '@ember/controller';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { service } from '@ember/service';
import { TABLE_OF_CONTENTS_CONFIG } from '../utils/constants';
import { tracked } from '@glimmer/tracking';
import { Schema } from '@lblod/ember-rdfa-editor';
import {
  em,
  link,
  strikethrough,
  strong,
  underline,
} from '@lblod/ember-rdfa-editor/marks';
import {
  block_rdfa,
  blockquote,
  bullet_list,
  code_block,
  hard_break,
  heading,
  horizontal_rule,
  image,
  inline_rdfa,
  list_item,
  ordered_list,
  paragraph,
  repaired_block,
  text,
  placeholder,
} from '@lblod/ember-rdfa-editor/nodes';
import {
  tableMenu,
  tableNodes,
  tablePlugin,
} from '@lblod/ember-rdfa-editor/plugins/table';
import { date } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/rdfa-date-plugin/nodes';
import { STRUCTURE_NODES } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/article-structure-plugin/structures';
import {
  variable,
  variableView,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/nodes';
import {
  tableOfContentsView,
  table_of_contents,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/table-of-contents-plugin/nodes';
import { tableOfContentsWidget } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/table-of-contents-plugin';
import {
  articleStructureContextWidget,
  articleStructureInsertWidget,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/article-structure-plugin';
import { invisible_rdfa } from '@lblod/ember-rdfa-editor/nodes/inline-rdfa';
import { insertVariableWidget } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin';
import { getOwner } from '@ember/application';
import { generateTemplate } from '../utils/generate-template';
export default class EditController extends Controller {
  @service store;
  @service router;
  @tracked editor;
  @tracked _editorDocument;
  @service intl;
  @service currentSession;

  get insertVariableWidgetOptions() {
    const config = getOwner(this).resolveRegistration('config:environment');
    return {
      publisher: this.currentSession.group.uri,
      defaultEndpoint: config.insertVariablePlugin.endpoint,
      variableTypes: ['text', 'number', 'date', 'codelist'],
    };
  }

  get schema() {
    return new Schema({
      nodes: {
        doc: {
          content: 'table_of_contents? ((chapter|block)+|(title|block)+)',
        },
        paragraph,

        repaired_block,

        list_item,
        ordered_list,
        bullet_list,
        placeholder,
        ...tableNodes({ tableGroup: 'block', cellContent: 'inline*' }),
        date: date({
          placeholder: {
            insertDate: this.intl.t('date-plugin.insert.date'),
            insertDateTime: this.intl.t('date-plugin.insert.datetime'),
          },
        }),
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
        table_of_contents: table_of_contents(TABLE_OF_CONTENTS_CONFIG),
        invisible_rdfa,
      },
      marks: {
        inline_rdfa,
        link,
        em,
        strong,
        underline,
        strikethrough,
      },
    });
  }

  get widgets() {
    return [
      tableMenu,
      tableOfContentsWidget,
      insertVariableWidget(this.insertVariableWidgetOptions),
      articleStructureContextWidget(),
      articleStructureInsertWidget(),
    ];
  }

  get nodeViews() {
    return (controller) => {
      return {
        variable: variableView(controller),
        table_of_contents: tableOfContentsView(TABLE_OF_CONTENTS_CONFIG)(
          controller
        ),
      };
    };
  }

  get plugins() {
    return [tablePlugin];
  }

  @action
  handleRdfaEditorInit(editor) {
    this.editor = editor;
    if (this.editorDocument.content) {
      editor.setHtmlContent(this.editorDocument.content);
    }
  }

  get dirty() {
    return this.editorDocument.content !== this.editor.htmlContent;
  }

  get editorDocument() {
    return this._editorDocument || this.model.editorDocument;
  }

  @task
  *publish() {
    yield this.save.perform();
    this.router.transitionTo('publish', this.model.documentContainer.id);
  }

  @task
  *save() {
    const html = this.editor.htmlContent;
    const templateVersion = generateTemplate(this.editor);
    const editorDocument = this.store.createRecord('editor-document');
    editorDocument.content = html;
    editorDocument.templateVersion = templateVersion;
    editorDocument.createdOn = this.model.editorDocument.createdOn;
    editorDocument.updatedOn = new Date();
    editorDocument.title = this.model.editorDocument.title;
    editorDocument.previousVersion = this.model.editorDocument;
    yield editorDocument.save();

    const documentContainer = this.model.documentContainer;
    documentContainer.currentVersion = editorDocument;
    yield documentContainer.save();
    this._editorDocument = editorDocument;
  }
}
