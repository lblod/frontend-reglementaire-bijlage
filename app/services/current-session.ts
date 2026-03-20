import { service } from '@ember/service';
import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import type Store from 'ember-data/store';
import AdministrativeUnitModel from 'frontend-reglementaire-bijlage/models/administrative-unit';
import type AccountModel from 'frontend-reglementaire-bijlage/models/account';
import type UserModel from 'frontend-reglementaire-bijlage/models/user';
import type BestuurseenheidClassificatieCodeModel from 'frontend-reglementaire-bijlage/models/administrative-unit-classification-code';
interface SessionService {
  isAuthenticated: boolean;
  data: {
    authenticated: {
      relationships: {
        group: { data: { id: string } };
        account: { data: { id: string } };
      };
      data: { attributes: { roles: string[] } };
    };
  };
}

export default class CurrentSessionService extends Service {
  @service declare session: SessionService;
  @service declare store: Store;

  @tracked account?: AccountModel;
  @tracked user?: UserModel;
  @tracked group?: AdministrativeUnitModel;
  @tracked roles: string[] = [];
  @tracked classification?: BestuurseenheidClassificatieCodeModel;

  async load() {
    if (this.session.isAuthenticated) {
      const accountId =
        this.session.data.authenticated.relationships.account.data.id;
      this.account = (await this.store.findRecord('account', accountId, {
        include: 'user',
      })) as AccountModel;
      this.user = (await this.account.user) as UserModel;

      const groupId: string =
        this.session.data.authenticated.relationships.group.data.id;
      this.group = (await this.store.findRecord(
        'administrative-unit',
        groupId,
        {
          include: 'classification',
        },
      )) as AdministrativeUnitModel;
      this.classification = (await this.group
        .classification) as BestuurseenheidClassificatieCodeModel;

      this.roles = this.session.data.authenticated.data.attributes.roles;
    }
  }
}
