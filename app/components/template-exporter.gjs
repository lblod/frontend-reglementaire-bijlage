import Component from '@glimmer/component';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import { task } from 'ember-concurrency';
import { service } from '@ember/service';
import { on } from '@ember/modifier';
import { download } from '../utils/file';
import t from 'ember-intl/helpers/t';

/**
 * @typedef TemplateExporterArgs
 * @property {Array<string>|Set<string>} [templateUris]
 * @property {Array<string>|Set<string>} [snippetListUris]
 */

/**
 * @extends {Component<TemplateExporterArgs>}
 */
export default class TemplateExporter extends Component {
  @service toaster;
  @service intl;
  /** @type {import('../services/mu-task').default} */
  @service muTask;

  get disabled() {
    return this.templateUris.length === 0 && this.snippetListUris.length === 0;
  }

  get templateUris() {
    return [...(this.args.templateUris ?? [])];
  }

  get snippetListUris() {
    return [...(this.args.snippetListUris ?? [])];
  }

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

  download = task(async () => {
    const loadingToast = this.createLoadingToast();
    try {
      const taskId = await this.muTask.fetchTaskifiedEndpoint(
        '/export-templates',
        {
          method: 'POST',
          body: JSON.stringify({
            documentContainerUris: this.templateUris,
            snippetListUris: this.snippetListUris,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      // For some reason we cannot 'include' the 'result.file' relationship here (probably related to polymorphism)
      const task = await this.muTask.waitForMuTaskTask.perform(
        taskId,
        { include: 'result' },
        400,
      );
      const result = await task.result;
      const file = await result.file;
      await download(file);
      this.closeToast(loadingToast);
      this.createSuccessToast();
    } catch (err) {
      console.error(err);
      this.closeToast(loadingToast);
      this.createErrorToast();
    }
  });

  <template>
    <AuButton
      @icon='export'
      {{on 'click' this.download.perform}}
      @disabled={{this.disabled}}
      @loading={{this.download.isRunning}}
    >
      {{t 'template-export.button'}}
    </AuButton>
  </template>
}
