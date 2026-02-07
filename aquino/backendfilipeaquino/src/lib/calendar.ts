// @ts-nocheck
import { zonedTimeToUtc } from 'date-fns-tz';

export const DEFAULT_TIMEZONE = 'America/Bahia';

export function toUtcFromBahia(date: Date | string) {
  return zonedTimeToUtc(date, DEFAULT_TIMEZONE);
}
