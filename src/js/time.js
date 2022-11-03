/**
 * Converts min/max times into time strings
 * @param {Object} param0 - Object containing the time
 * @param {number} param0.min - Minimum amount of time, in minutes
 * @param {number} param0.max - Maximum amount of time, in minutes
 * @return {string | boolean} - Returns a string if the time is valid, otherwise returns false
 */
export function buildTiming({ min, max }) {
  if (min || max) {
    if (min !== max) {
      return `${buildTimeString(min)} - ${buildTimeString(max)}`;
    } else {
      return `${buildTimeString(min)}`;
    }
  }
  return false;
}

/**
 * Converts a time string into hours or a combination of hours and minutes, depending on how many minutes are in the time
 * @param {number} t - Time, in minutes
 * @return {string} - Returns a string containing the time
 */
export function buildTimeString(t) {
  if (t > 60) {
    const h = Math.floor(t / 60);
    const m = t % 60;

    let tm = `${h} hour${h > 1 ? 's' : ''}`;

    if (m > 0) {
      tm += ` ${m} minute${m > 1 ? 's' : ''}`;
    }

    return tm;
  } else {
    return `${t} minute${t > 1 ? 's' : ''}`;
  }
}
