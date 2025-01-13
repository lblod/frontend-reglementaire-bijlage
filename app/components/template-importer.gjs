import Component from '@glimmer/component';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import AuModal from '@appuniversum/ember-appuniversum/components/au-modal';
import AuLabel from '@appuniversum/ember-appuniversum/components/au-label';
import { task } from 'ember-concurrency';
import { service } from '@ember/service';
import { on } from '@ember/modifier';
import { tracked } from 'tracked-built-ins';
import { action } from '@ember/object';
import { v4 as uuid } from 'uuid';
import { not } from 'ember-truth-helpers';
import t from 'ember-intl/helpers/t';

export default class TemplateImporter extends Component {
  @service intl;
  @service toaster;
  @service muTask;

  @tracked showDialog = false;
  @tracked selectedFile = null;
  formId = uuid();

  createLoadingToast() {
    return this.toaster.loading(
      this.intl.t('template-export.toast.loading.message'),
      this.intl.t('template-export.toast.loading.title'),
      {
        closable: false,
      },
    );
  }

  createSuccessToast() {
    return this.toaster.success(
      this.intl.t('template-export.toast.success.message'),
      this.intl.t('template-export.toast.success.title'),
      {
        timeOut: 2000,
        closable: true,
      },
    );
  }

  createErrorToast() {
    return this.toaster.error(
      this.intl.t('template-export.toast.error.message'),
      this.intl.t('template-export.toast.error.title'),
      {
        closable: true,
      },
    );
  }

  closeToast(toast) {
    this.toaster.close(toast);
  }

  upload = task(async () => {
    const loadingToast = this.createLoadingToast();
    try {
      const formData = new FormData();
      formData.set('file', this.selectedFile);

      const taskId = await this.muTask.fetchTaskifiedEndpoint(
        '/import-templates',
        {
          method: 'POST',
          body: formData,
        },
      );
      await this.muTask.waitForMuTaskTask.perform(taskId, {}, 400);
      this.closeToast(loadingToast);
      this.createSuccessToast();
    } catch (e) {
      console.error(e);
      this.closeToast(loadingToast);
      this.createErrorToast();
    }
  });

  @action
  selectFile(event) {
    console.log('File: ', event.target.files[0]);
    this.selectedFile = event.target.files[0];
  }

  @action
  openDialog() {
    this.showDialog = true;
  }

  @action
  closeDialog() {
    this.showDialog = false;
  }

  @action
  cancel() {
    this.selectedFile = null;
    this.closeDialog();
  }

  @action
  async submit() {
    this.closeDialog();
    await this.upload.perform();
  }

  <template>
    <AuButton
      @icon='import'
      {{on 'click' this.openDialog}}
      @loading={{this.upload.isRunning}}
    >
      {{t 'template-import.button'}}
    </AuButton>
    {{#if this.showDialog}}
      <AuModal @modalOpen={{true}}>
        <:title>{{t 'template-import.modal.title'}}</:title>
        <:body>
          <form id={{this.formId}} {{on 'submit' this.submit}}>
            <div>
              {{#let (uuid) as |id|}}
                <AuLabel for={{id}}>
                  {{t 'template-import.modal.form.fields.file'}}
                </AuLabel>
                <input
                  type='file'
                  id={{id}}
                  accept='.zip'
                  {{on 'change' this.selectFile}}
                />
              {{/let}}
            </div>
          </form>
        </:body>
        <:footer>
          <AuButton
            form={{this.formId}}
            type='submit'
            disabled={{not this.selectedFile}}
          >
            {{t 'template-import.modal.form.actions.submit'}}
          </AuButton>
          <AuButton type='button' {{on 'click' this.cancel}} @skin='secondary'>
            {{t 'template-import.modal.form.actions.cancel'}}
          </AuButton>
        </:footer>
      </AuModal>
    {{/if}}
  </template>
}
