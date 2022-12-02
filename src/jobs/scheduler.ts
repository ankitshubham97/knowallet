import schedule from 'node-schedule';

const heartBeat = () => {
  console.log(new Date().toTimeString(), 'heartBeat');
};

async function scheduler() {
  console.log('Started scheduler job');

  // Once a day jobs
  // schedule.scheduleJob('30 18 * * *', updateSitemap); // 18:30 UTC = 00:00 IST

  // Run HeartBeat job every 5 minutes.
  schedule.scheduleJob('* */5 * * * *', heartBeat);
}

scheduler();
