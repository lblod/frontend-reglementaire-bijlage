import Model, { attr } from '@ember-data/model';

export default class FileModel extends Model {
  @attr declare name: string;
  @attr declare format: string;
  @attr declare size: string;
  @attr declare extension: string;
  @attr('datetime') declare created: Date;

  get humanReadableSize() {
    //ripped from https://stackoverflow.com/questions/15900485/correct-way-to-convert-size-in-bytes-to-kb-mb-gb-in-javascript
    const bytes = Number(this.size);
    const decimals = 2;
    if (!+this.size) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = [
      'Bytes',
      'KiB',
      'MiB',
      'GiB',
      'TiB',
      'PiB',
      'EiB',
      'ZiB',
      'YiB',
    ];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  }

  get downloadLink() {
    return `/files/${this.id}/download?name=${this.name}`;
  }
}
