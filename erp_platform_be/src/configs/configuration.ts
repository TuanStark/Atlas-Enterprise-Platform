export default () => ({
  environment: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '8080', 10),
  database: {
    url: process.env.DATABASE_URL,
  },
});
