import pidusage from 'pidusage';
import { Logger } from '@nestjs/common';

// Avoid using setInterval as they could overlap with asynchronous processing
function compute(cb: () => void) {
  pidusage(process.pid, function (err, stats) {
    Logger.debug(
      `CPU: ${stats.cpu.toFixed(1)}% Memory: ${(stats.memory / 1024 / 1024).toFixed(1)} MB`
    );

    cb();
  });
}

export function pidInterval(ms: number) {
  setTimeout(function () {
    compute(function () {
      pidInterval(ms);
    });
  }, ms);
}
