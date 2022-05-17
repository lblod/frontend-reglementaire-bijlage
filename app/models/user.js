import Model, { attr, hasMany } from '@ember-data/model';

export default class UserModel extends Model {
  @attr firstName;
  @attr familyName;
  @attr rijksregisterNummer;

  @hasMany('account', { inverse: null })
  account;

  @hasMany('groups', { inverse: null })
  groups;

  get fullName() {
    return `${this.firstName} ${this.lastName}`.trim();
  }
}
