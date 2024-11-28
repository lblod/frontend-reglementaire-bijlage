import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { dropTask, timeout } from 'ember-concurrency';
import { service } from '@ember/service';
import { action } from '@ember/object';

export default class ImportController extends Controller {
  @service templateFetcher;
  @service router;
  @tracked endpoint = 'https://reglementairebijlagen.lblod.info/';
  @tracked templateUri;
  @tracked name;
  @tracked type;
  @tracked options;
  typeOptions = [
    {
      uri: 'http://data.lblod.info/vocabularies/gelinktnotuleren/ReglementaireBijlageTemplate',
      label: 'Reglementaire Bijlage',
    },
    {
      uri: 'http://data.vlaanderen.be/ns/besluit#BehandelingVanAgendapunt',
      label: 'Besluit',
    },
  ];

  @action
  importUri(uri) {
    this.router.transitionTo('import.uri', {
      queryParams: { uri, endpoint: this.endpoint },
    });
  }

  @action
  updateParam(field, event) {
    this[field] = event.target.value;
  }
  connectToEndpoint = dropTask(async () => {
    await timeout(400);
    this.options = await this.templateFetcher.fetch.perform({
      endpoint: this.endpoint,
      name: this.name,
      type: this.type?.uri,
    });
  });
}
