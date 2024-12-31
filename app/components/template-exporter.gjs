import Component from '@glimmer/component';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import { task } from 'ember-concurrency';
import { service } from '@ember/service';
import { on } from '@ember/modifier';

export default class TemplateExporter extends Component {
  @service toaster;
  @service intl;
  @service muTask;

  get disabled() {
    return this.args.templateUris.size === 0;
  }

  download = task(async () => {
    try {
      const taskId = await this.muTask.fetchTaskifiedEndpoint(
        '/export-templates',
        {
          method: 'POST',
          body: JSON.stringify({
            documentContainerUris: [...this.args.templateUris.values()],
            snippetListUris: this.args.snippetListUris
              ? [...this.args.snippetListUris.values()]
              : [],
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      // TODO add extra params so that we can `include` result and file
      const task = await this.muTask.waitForMuTaskTask.perform(taskId, 400);
      const result = await task.result;
      const file = await result.file;
      console.log('Successfully exported', task, file.downloadLink);
    } catch (err) {
      console.warn('failed export!', err);
      this.toaster.error('Error exporting templates', { timeOut: 1000 });
    }
  });

  <template>
    <AuButton
      @icon='export'
      {{on 'click' this.download.perform}}
      @disabled={{this.disabled}}
      @loading={{this.download.isRunning}}
    >
      Export
    </AuButton>
  </template>
}
