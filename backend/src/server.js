
require('dotenv').config();

const Fastify = require('fastify');

const app = Fastify({
  logger: true,
  trustProxy: true
});

app.get('/health', async () => {
  return {
    success: true,
    message: 'Arsip Surat API is running',
    timestamp: new Date().toISOString()
  };
});

const start = async () => {
  try {
    const port = Number(process.env.PORT || 4000);

    await app.listen({
      port,
      host: '0.0.0.0'
    });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

start();
