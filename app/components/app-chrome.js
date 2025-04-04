import Component from '@glimmer/component';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { getTemplateType } from '../utils/template-type';
import EditorDocumentModel from '../models/editor-document';
import SnippetVersionModel from '../models/snippet-version';

/**
 * @typedef PublishSaveAction
 * @property {async () => void} action
 * @property {boolean} isRunning
 */
/**
 * @typedef AppChromeComponentSignature
 * @property {EditorDocumentModel | SnippetVersionModel} document
 * @property {async () => void} onUpdateDocumentTitle
 * @property {boolean|undefined} readonly
 * @property {string|undefined} templateTypeId
 * @property {boolean|undefined} dirty
 * @property {PublishSaveAction|undefined} save
 * @property {PublishSaveAction|undefined} publish
 */
/** @extends {Component<AppChromeComponentSignature>} */
export default class AppChromeComponent extends Component {
  @service currentSession;
  @service features;
  @service intl;
  @service router;

  get document() {
    return this.args.document;
  }

  get updatedOn() {
    if (this.document instanceof EditorDocumentModel) {
      return this.document.updatedOn;
    } else if (this.document instanceof SnippetVersionModel) {
      return this.document.createdOn;
    } else {
      return null;
    }
  }

  templateTypeLabel =
    this.args.templateTypeId &&
    getTemplateType(this.args.templateTypeId, this.intl)?.label;

  updateDocumentTitle = task(async (title) => {
    this.document.title = title;
    await this.document.save();

    if (this.args.onUpdateDocumentTitle) {
      await this.args.onUpdateDocumentTitle();
    }
  });

  resetDocument = task(async () => {
    this.document.rollbackAttributes();
  });
}
