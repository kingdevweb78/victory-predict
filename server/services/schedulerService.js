class SchedulerService {
  constructor() {
    this.jobs = [];
    this.running = false;
  }

  start() {
    this.running = true;
    this.addJob('Daily Predictions', '0 7 * * *', async () => {
      try {
        console.log('[Scheduler] Running daily predictions...');
      } catch (e) {
        console.log('[Scheduler] Error:', e.message);
      }
    });
    console.log('[Scheduler] Started ✅');
  }

  addJob(name, cronExpr, fn) {
    this.jobs.push({ name, cron: cronExpr, fn });
  }

  stop() {
    this.running = false;
  }

  getJobs() {
    return this.jobs.map(j => ({ name: j.name, cron: j.cron }));
  }
}

module.exports = new SchedulerService();
