module.exports = {
  apps: [{
    name: 'reteki-outreach',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/reteki-outreach',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/pm2/reteki-outreach-error.log',
    out_file: '/var/log/pm2/reteki-outreach-out.log',
    log_file: '/var/log/pm2/reteki-outreach.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024',
    watch: false,
    ignore_watch: ['node_modules', 'logs'],
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
