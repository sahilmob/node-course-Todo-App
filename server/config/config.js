var env = process.env.NODE_ENV || 'development'

if (env === 'development' || env === 'test') {
    var config = require('./config.json')
        //we used [env] because we want to use the variable env to select configuration object
    var envConfig = config[env]

    Object.keys(envConfig).forEach((key) => {
        process.env[key] = envConfig[key]
    })
}