import Service from '@ember/service';
import { task, timeout } from 'ember-concurrency';
import { JOB_STATUSES } from '../utils/constants';
import { service } from '@ember/service';

export default class MuTaskService extends Service {
  @service store;

  fetchMuTask(taskId) {
    try {
      return this.store.findRecord('task', taskId);
    } catch (e) {
      throw new Error(`An error occured while fetching task ${taskId}`);
    }
  }

  /**
   * @param {string} taskId
   * @param {number} [pollDelayMs] time to wait between each status poll
   * @param {number} [timeoutMs] maximum time to wait before throwing
   * */
  waitForMuTaskTask = task(
    async (taskId, pollDelayMs = 1000, timeoutMs = 300000) => {
      const startTime = Date.now();
      let task;
      do {
        await timeout(pollDelayMs);
        task = await this.fetchMuTask(taskId);
      } while (
        (task.status === JOB_STATUSES.busy ||
          task.status === JOB_STATUSES.scheduled) &&
        Date.now() - startTime < timeoutMs
      );

      if (task.status === JOB_STATUSES.success) {
        return task;
      } else if (task.status === JOB_STATUSES.failed) {
        throw new Error('Task failed.');
      } else if (task.status === JOB_STATUSES.busy) {
        throw new Error('Task timed out.');
      } else {
        throw new Error('Task in unexpected state');
      }
    },
  );

  async fetchTaskifiedEndpoint(url, fetchOptions) {
    const res = await fetch(url, fetchOptions);
    if (res.ok) {
      const json = await res.json();
      return json.data.id;
    } else {
      throw new Error(await res.text());
    }
  }
}
