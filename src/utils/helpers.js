export function secondsToDate(secObj) {
  if (!secObj) return null;
  if (secObj.seconds) return new Date(secObj.seconds * 1000);
  return new Date(secObj);
}
