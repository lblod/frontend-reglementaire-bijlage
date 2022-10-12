import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class CodelistController extends Controller {
  @service router;
  @tracked isOpen = false;
  @tracked options = [];

  @action
  async didInsert() {
    const concepts = (await this.model.codelist.concepts).toArray();
    this.options = concepts.sort((a, b) => {
      if (!a.createdOn && !b.createdOn) {
        return 0;
      }
      if (!a.createdOn) {
        return -1;
      }
      if (!b.createdOn) {
        return 1;
      }
      if (a.createdOn === b.createdOn) return 0;
      return a.createdOn > b.createdOn ? 1 : -1;
    });
  }
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
