import Model, { attr, belongsTo, type AsyncBelongsTo } from '@ember-data/model';
import type { Type } from '@warp-drive/core-types/symbols';
import type UserModel from './user';

export default class AccountModel extends Model {
  declare [Type]: 'account';

  @attr voId?: string;
  @attr provider?: string;
  @belongsTo<UserModel>('user', { inverse: null, async: true })
  declare user: AsyncBelongsTo<UserModel>;
}
