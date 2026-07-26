module.exports = {
  apps: [
    {
      name: 'studymate-backend',
      cwd: __dirname + '/..',
      script: 'dist/index.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
