export function formatRelativeTime(
  instant: Temporal.Instant,
  options: {
    style?: Intl.RelativeTimeFormatOptions['style']
    numeric?: Intl.RelativeTimeFormatOptions['numeric']
  } = {},
): string {
  const { style = 'long', numeric = 'auto' } = options
  const now = Temporal.Now.instant()
  const diffSeconds = instant.until(now).seconds
  const absDiffSeconds = Math.abs(diffSeconds)
  const found = [
    { name: 'year' as const, seconds: 60 * 60 * 24 * 365 },
    { name: 'month' as const, seconds: 60 * 60 * 24 * 30 },
    { name: 'week' as const, seconds: 60 * 60 * 24 * 7 },
    { name: 'day' as const, seconds: 60 * 60 * 24 },
    { name: 'hour' as const, seconds: 60 * 60 },
    { name: 'minute' as const, seconds: 60 },
    { name: 'second' as const, seconds: 1 },
  ].find(({ seconds }) => absDiffSeconds >= seconds)
  const unit = found === undefined ? 'second' : found.name
  const diff = found === undefined ? 0 : Math.round(diffSeconds / found.seconds)
  const rtf = new Intl.RelativeTimeFormat('en', { style, numeric })
  return rtf.format(-diff, unit)
}

export function formatInstant(utcDateTimeString: string) {
  const instant = Temporal.Instant.from(utcDateTimeString)
  const zonedDateTime = instant.toZonedDateTimeISO(Temporal.Now.timeZoneId())
  const formatter = new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
  return formatter.format(zonedDateTime.toInstant().epochMilliseconds)
}
