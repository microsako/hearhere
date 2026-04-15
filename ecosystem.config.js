module.exports = {
  apps: [
    {
      name: 'hearhere-backend',
      script: 'server.js',
      cwd: '/home/ubuntu/hearhere/backend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    },
    {
      name: 'hearhere-frontend',
      script: './node_modules/.bin/vite',
      args: 'serve --host 0.0.0.0 --port 8080',
      cwd: '/home/ubuntu/hearhere/frontend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
