/** Australian state → IANA timezone (job location wall clock). */
export const STATE_TZ: Record<string, string> = {
  NSW: 'Australia/Sydney',
  ACT: 'Australia/Sydney',
  VIC: 'Australia/Melbourne',
  TAS: 'Australia/Hobart',
  QLD: 'Australia/Brisbane',
  SA: 'Australia/Adelaide',
  WA: 'Australia/Perth',
  NT: 'Australia/Darwin',
}
 
export function getStateTimezone(state?: string | null): string {
  const key = state?.trim().toUpperCase()
  return (key && STATE_TZ[key]) || 'Australia/Sydney'
}

function getPartsInTimezone(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-AU', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date)

  const pick = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? ''

  return {
    year: pick('year'),
    month: pick('month'),
    day: pick('day'),
    hour: pick('hour'),
    minute: pick('minute'),
  }
}

/** Calendar date YYYY-MM-DD in the given state's timezone. */
export function getDateStringInState(date: Date, state?: string | null): string {
  const { year, month, day } = getPartsInTimezone(date, getStateTimezone(state))
  return `${year}-${month}-${day}`
}

/** datetime-local string (wall clock in state TZ, not browser TZ). */
export function formatDatetimeLocalInState(date: Date, state?: string | null): string {
  const { year, month, day, hour, minute } = getPartsInTimezone(date, getStateTimezone(state))
  return `${year}-${month}-${day}T${hour}:${minute}`
}

/** Interpret datetime-local digits as wall time in state TZ → UTC ISO. */
export function datetimeLocalInStateToISO(localStr: string, state?: string | null): string {
  const tz = getStateTimezone(state)
  const provisional = new Date(localStr + 'Z')

  const dtf = new Intl.DateTimeFormat('en-AU', {
    timeZone: tz,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  const [auH, auM] = dtf.format(provisional).split(':').map(Number)

  const [, timePart] = localStr.split('T')
  const [wantH, wantM] = timePart.split(':').map(Number)
  let diffMinutes = wantH * 60 + wantM - (auH * 60 + auM)

  if (diffMinutes > 12 * 60) diffMinutes -= 24 * 60
  if (diffMinutes < -12 * 60) diffMinutes += 24 * 60

  return new Date(provisional.getTime() + diffMinutes * 60_000).toISOString()
}

export function isTodayInState(localStr: string, state?: string | null): boolean {
  const [datePart] = localStr.split('T')
  if (!datePart) return false
  return datePart === getDateStringInState(new Date(), state)
}

/** When user picks today, snap to current state time (with optional lead). */
export function snapTodayToStateNow(
  localStr: string,
  state?: string | null,
  leadMinutes = 60
): string {
  const tz = getStateTimezone(state)
  const today = getDateStringInState(new Date(), state)
  const earliest = formatDatetimeLocalInState(
    new Date(Date.now() + leadMinutes * 60_000),
    state
  )
  const [, timePart] = earliest.split('T')
  return `${today}T${timePart}`
}

export function applyStateScheduleChange(
  value: string,
  state?: string | null,
  leadMinutes = 60
): string {
  if (!value) return ''
  if (isTodayInState(value, state)) {
    return snapTodayToStateNow(value, state, leadMinutes)
  }
  return value
}

export function getMinScheduledDatetimeLocal(state?: string | null, leadMinutes = 60): string {
  return formatDatetimeLocalInState(new Date(Date.now() + leadMinutes * 60_000), state)
}

export function getMaxScheduledDatetimeLocal(state?: string | null, daysAhead = 30): string {
  return formatDatetimeLocalInState(
    new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000),
    state
  )
}

/** Short label for UI, e.g. "NSW (Australia/Sydney)". */
export function getStateTimeLabel(state?: string | null): string {
  const key = state?.trim().toUpperCase()
  if (key && STATE_TZ[key]) return `${key} time`
  return 'Australian Eastern time'
}
