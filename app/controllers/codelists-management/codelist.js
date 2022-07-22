import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class CodelistController extends Controller {
  @service router;
  @tracked isOpen = false;

  @action
  async removeCodelist(event) {
    event.preventDefault();

    await Promise.all(
      this.model.codelist.concepts.map((option) => option.destroyRecord())
    );

    await this.model.codelist.destroyRecord();
    this.router.transitionTo('codelists-management');
  }

  reset() {
    this.isOpen = false;
  }
}
