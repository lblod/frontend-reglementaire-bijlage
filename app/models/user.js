import Model, { attr, hasMany } from '@ember-data/model';

export default class UserModel extends Model {
  @attr firstName;
  @attr familyName;
  @attr rijksregisterNummer;

  @hasMany('account', { inverse: null, async: true })
  account;

  @hasMany('administrative-units', { inverse: null, async: true })
  groups;

  get fullName() {
    return `${this.firstName} ${this.lastName}`.trim();
  }
}
