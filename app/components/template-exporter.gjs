import Component from '@glimmer/component';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import { task, timeout } from 'ember-concurrency';
import { service } from '@ember/service';
import { on } from '@ember/modifier';
import { NotImplementedError } from '@lblod/ember-rdfa-editor/utils/_private/errors';

export default class TemplateExporter extends Component {
  @service toaster;
  @service intl;

  get templateURIs() {
    return this.args.templateURIs ?? [];
  }

  get snippetListURIs() {
    return this.args.snippetListURIs ?? [];
  }

  get disabled() {
    if (!this.snippetListURIs && !this.templateURIs) {
      return true;
    }
    if (this.download.isRunning) {
      return true;
    }
    return false;
  }

  download = task(async () => {
    throw new NotImplementedError();
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
