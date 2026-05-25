module.exports = {
  apps: [
    {
      name: 'prospector-backend',
      script: './backend/server.js',
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',
      env: { NODE_ENV: 'production' },
      error_file: './backend/logs/error.log',
      out_file:   './backend/logs/out.log',
      time: true,
      restart_delay: 5000,
    },
    {
      name: 'prospector-frontend',
      script: 'node_modules/.bin/next',
      args: 'start -p 3000',
      cwd: __dirname + '/frontend',
      instances: 1,
      exec_mode: 'fork',
      env: { NODE_ENV: 'production' },
      error_file: './backend/logs/frontend-error.log',
      out_file:   './backend/logs/frontend-out.log',
      time: true,
    },
  ],
};
