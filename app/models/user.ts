import Model, { attr, hasMany, type AsyncHasMany } from '@ember-data/model';
import type { Type } from '@warp-drive/core-types/symbols';
import type AccountModel from './account';
import type AdministrativeUnitModel from './administrative-unit';

export default class UserModel extends Model {
  declare [Type]: 'user';

  @attr firstName?: string;
  @attr familyName?: string;
  @attr rijksregisterNummer?: string;

  @hasMany<AccountModel>('account', { inverse: null, async: true })
  declare account: AsyncHasMany<AccountModel>;

  @hasMany<AdministrativeUnitModel>('administrative-unit', {
    inverse: null,
    async: true,
  })
  declare groups: AsyncHasMany<AdministrativeUnitModel>;

  get fullName() {
    return `${this.firstName} ${this.familyName}`.trim();
  }
}
