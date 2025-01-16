import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { v4 as uuid } from 'uuid';
import FileUploadButton from './file-upload-button';
import t from 'ember-intl/helpers/t';

/**
 * @typedef Args
 * @property {() => void} [onSuccess]
 * @property {(error?: unknown) => void} [onError]
 */

/**
 * @extends {Component<Args>}
 */
export default class TemplateImporter extends Component {
  @service intl;
  @service toaster;
  @service muTask;

  formId = uuid();

  createLoadingToast() {
    return this.toaster.loading(
      this.intl.t('template-import.toast.loading.message'),
      this.intl.t('template-import.toast.loading.title'),
      {
        closable: false,
      },
    );
  }

  createSuccessToast() {
    return this.toaster.success(
      this.intl.t('template-import.toast.success.message'),
      this.intl.t('template-import.toast.success.title'),
      {
        timeOut: 2000,
        closable: true,
      },
    );
  }

  createErrorToast() {
    return this.toaster.error(
      this.intl.t('template-import.toast.error.message'),
      this.intl.t('template-import.toast.error.title'),
      {
        closable: true,
      },
    );
  }

  closeToast(toast) {
    this.toaster.close(toast);
  }

  upload = task(async (file) => {
    const loadingToast = this.createLoadingToast();
    try {
      const formData = new FormData();
      formData.set('file', file);

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
      this.args.onSuccess?.();
    } catch (e) {
      console.error(e);
      this.closeToast(loadingToast);
      this.createErrorToast();
      this.args.onError?.(e);
    }
  });

  @action
  async selectFile(event) {
    const selectedFile = event.target.files[0];
    await this.upload.perform(selectedFile);
  }

  <template>
    <FileUploadButton
      @icon='import'
      @multiple={{false}}
      @accept='.zip'
      @onChange={{this.selectFile}}
      @loading={{this.upload.isRunning}}
    >
      {{t 'template-import.button'}}
    </FileUploadButton>
  </template>
}
