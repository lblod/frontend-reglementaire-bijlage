import { Changeset } from 'ember-changeset';
import { type BufferedChangeset } from 'ember-changeset/types';
import { tracked } from '@glimmer/tracking';
import lookupValidator, {
  type ValidatorMap,
} from 'ember-changeset-validations';
import type Model from '@ember-data/model';

/**
 * ### Usage
 * Pass a list of (the same) records, a validator for such a record and the key and value of the belongsTo parent.
 * This will automatically clean up the passed records to `new` when calling `rollback` or `remove`.
 * NOTE: - the passed list of records should not contain new records (record.isNew == true).
 *         Use `new` instead, which also sets the parent for you.
 */
export default function changesetList<T extends Model, K extends keyof T>(
  records: T[],
  validation: ValidatorMap,
  [key, parent]: [K, T[K]],
) {
  return new ChangesetList<T, K>(records, validation, [key, parent]);
}

/**
 * ### Neccesity
 * ember-data supports "kind of" a changeset by changing the record itself and using `changedAttributes` and `rollbackAttributes` for numbers/strings/date/boolean attributes.
 * ember-changeset doesn't change the record and supports validation.
 * Both don't support relationships. ChangesetList can be used to track changes of a list of records (often a hasMany relation).
 *
 * ### Implementation details
 * - `new` expects the caller to pass a new record, because adding service `store` is not possible. (there might be a better way)
 * - This expects the full record list to be passed at construction
 *   Afterwards only adding new records (via `new`) and `remove`ing records is allowed. No exisiting records can be added.
 * - Changing a passed record (instead of the changeset) might create unspecified behaviour.
 */
export class ChangesetList<T extends Model, K extends keyof T> {
  @tracked _originalRecords: T[] = [];
  @tracked _records: T[] = [];
  @tracked _changesets: BufferedChangeset[] = [];
  @tracked _toDelete: T[] = [];
  validation: ValidatorMap;
  parentKey: keyof T;
  parentRecord: T[K];

  constructor(
    records: T[],
    validation: ValidatorMap,
    [parentKey, parentRecord]: [K, T[K]],
  ) {
    this._originalRecords = records;
    this.validation = validation;
    this._initialize();
    this.parentKey = parentKey;
    this.parentRecord = parentRecord;
  }

  get changesets() {
    return this._changesets;
  }

  get length() {
    return this._changesets.length;
  }

  createChangeset(record: T) {
    return Changeset(record, lookupValidator(this.validation), this.validation);
  }

  _initialize() {
    this._records = this._originalRecords.slice();
    this._changesets = this._records.map((record) =>
      this.createChangeset(record),
    );
  }

  get isValid() {
    return this._changesets.every((changeset) => changeset.isValid);
  }

  get isInvalid() {
    return !this.isValid;
  }

  get isPristine() {
    return (
      this._changesets.every((changeset) => changeset.isPristine) &&
      this._toDelete.length === 0
    );
  }

  async validate() {
    await Promise.all(
      this._changesets.map((changeset) => changeset.validate()),
    );
  }

  /**
   * add a new record to the changeset list. ChangesetList will handle cleanup of this record.
   * @param {Record} newRecord
   */
  new(newRecord: T) {
    newRecord[this.parentKey] = this.parentRecord;
    this._records = [...this._records, newRecord];
    const changeset = this.createChangeset(newRecord);
    this._changesets = [...this._changesets, changeset];
  }

  remove(changeset: BufferedChangeset) {
    const index = this._changesets.findIndex((ch) => ch === changeset);
    const record = this._records[index];
    if (!record) return;

    if (record.isNew) {
      record.rollbackAttributes();
    } else {
      this._toDelete = [...this._toDelete, record];
    }
    this._changesets = this._changesets.filter((c) => c !== changeset);
    this._records = this._records.filter((r) => r !== record);
  }

  async save() {
    await Promise.all([
      ...this._changesets.map((changeset) => changeset.save()),
      ...this._toDelete.map((record) => record.destroyRecord()),
    ]);
    this._originalRecords = this._records.slice();
    this._toDelete = [];
    return this._originalRecords;
  }

  // Quick and dirty: just resets the class like it was constructed originally.
  // remove all created (new) records. Only this class has a reference to them.
  rollback() {
    this._records.forEach((record) => {
      if (record.isNew) {
        record.rollbackAttributes();
      }
    });
    this._initialize();
    this._toDelete = [];
  }
}
