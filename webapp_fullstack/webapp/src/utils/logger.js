// filepath: webapp/src/utils/logger.js
const DEBUG = import.meta.env.MODE !== 'production';
export function log(...args) {
  if (DEBUG) console.log(...args);
}
export function warn(...args) {
  if (DEBUG) console.warn(...args);
}
export function error(...args) {
  if (DEBUG) console.error(...args);
}