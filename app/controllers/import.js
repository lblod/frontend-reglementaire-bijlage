import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { dropTask, timeout } from 'ember-concurrency';
import { service } from '@ember/service';

export default class ImportController extends Controller {
  @service templateFetcher;
  @tracked endpoint = 'https://reglementairebijlagen.lblod.info/';
  @tracked options;
  @action
  updateEndpoint(input) {
    this.endpoint = input;
  }

  connectToEndpoint = dropTask(async () => {
    await timeout(400);
    this.options = await this.templateFetcher.fetch.perform({ endpoint: this.endpoint})
  });
}
