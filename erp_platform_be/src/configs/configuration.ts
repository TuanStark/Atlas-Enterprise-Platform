function parseDurationToSeconds(duration: string | undefined, defaultSeconds: number): number {
  if (!duration) return defaultSeconds;
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) {
    const parsed = parseInt(duration, 10);
    return isNaN(parsed) ? defaultSeconds : parsed;
  }
  const value = parseInt(match[1], 10);
  const unit = match[2];
  switch (unit) {
    case 's':
      return value;
    case 'm':
      return value * 60;
    case 'h':
      return value * 3600;
    case 'd':
      return value * 86400;
    default:
      return defaultSeconds;
  }
}

export default () => ({
  environment: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '8080', 10),
  database: {
    url: process.env.DATABASE_URL,
  },
  JWT: {
    ACCESS_TOKEN_EXPIRATION: parseDurationToSeconds(process.env.ACCESS_TOKEN_EXPIRATION, 3600),
  },
});
