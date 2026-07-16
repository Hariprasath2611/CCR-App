import app from './app';

const PORT = process.env.PORT || 3000;

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`========================================`);
  console.log(`  CCMS API Server running on port ${PORT} `);
  console.log(`  Listening on http://0.0.0.0:${PORT}    `);
  console.log(`========================================`);
});
