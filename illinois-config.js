var config = {};

config.port = 4000;
config.sessionSecret = 'not secret';

// Set to false if the server is not on the campus network
// This will disable AD authentication and LDAP name lookup
config.authenticationEnabled = true;

// Set to false to disable sending of emails
config.emailEnabled = true;
config.smtp = {
    host: 'outbound-relays.techservices.illinois.edu',
    port: 25,
    secure: false
}
config.mailDefaults = {
    from: '"Attendance" <no-reply@illinois.edu>'
}

config.db = {
    development: {
        host: 'localhost',
        database: 'attendance',
        username: 'root',
        password: null,
        logging: console.log,
        dialect: 'mysql',
    },
    production: {
        host: 'localhost',
        database: 'attendance',
        username: 'root',
        password: null,
        logging: false,
        dialect: 'mysql',
    },
    test: {
        host: 'localhost',
        database: 'attendance_test',
        username: 'root',
        password: null,
        logging: false,
        dialect: 'mysql',
    },
};

// Session cookies generated when logging into my.cs.illinois.edu
// Used to fetch i-card photos
config.myCSCookie = {
    aspSessionId: 'ASPSESSIONID*=value',
    portalSession: 'PORTAL%5FSESSION=value'
};

module.exports = config;
