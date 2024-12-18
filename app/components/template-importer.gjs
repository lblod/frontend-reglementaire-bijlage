import Component from '@glimmer/component';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import AuModal from '@appuniversum/ember-appuniversum/components/au-modal';
import AuFileUpload from '@appuniversum/ember-appuniversum/components/au-file-upload';
import { task, timeout } from 'ember-concurrency';
import { service } from '@ember/service';
import { on } from '@ember/modifier';
import { tracked } from 'tracked-built-ins';
import { NotImplementedError } from '@lblod/ember-rdfa-editor/utils/_private/errors';

export default class TemplateImporter extends Component {
  @service intl;
  @tracked showDialog = false;

  upload = task(async () => {
    throw new NotImplementedError();
    this.showDialog = true;
  });

  <template>
    <AuButton
      @icon='import'
      {{on 'click' this.upload.perform}}
      {{!-- @disabled={{this.disabled}} --}}
      @loading={{this.upload.isRunning}}
    >
      Import
    </AuButton>
    {{#if this.showDialog}}
      <AuModal @modalOpen={{true}}>
        <:title>Import templates</:title>
        <:body>
          <AuFileUpload @accept='.zip' />
        </:body>
      </AuModal>
    {{/if}}
  </template>
}
