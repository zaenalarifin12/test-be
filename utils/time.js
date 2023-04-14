const moment = require("moment-timezone");

function formatDateInTimezone(date, timezone) {
  return moment.tz(date, `Asia/Jakarta`).format("YYYY-MM-DD");
}

module.exports = {
  formatDateInTimezone,
};
