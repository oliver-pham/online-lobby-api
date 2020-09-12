const path = require('path');
const fs = require('fs');
const readline = require('readline');
const configFolder = path.join(__dirname, 'api', 'config');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

if (!fs.existsSync(configFolder)) {
    fs.mkdirSync(configFolder);
}

var config = {
    host: "localhost",
    port: 3030,
    public: "../public/",
    paginate: {
        default: 10,
        max: 50
    },
    authentication: {
        entity: "user",
        service: "users",
        secret: "",
        authStrategies: [
            "jwt",
            "local",
            "anonymous"
        ],
        jwtOptions: {
            header: {
                type: "access"
            },
            audience: "https://yourdomain.com",
            issuer: "feathers",
            algorithm: "HS256",
            expiresIn: "1d"
        },
        local: {
            usernameField: "email",
            passwordField: "password"
        }
    },
    mongodb: ""
};

rl.question("host: (localhost) ", function (host) {
    var h = host || "localhost";
    config.host = h;
    rl.question("port: (3030) ", function (port) {
        var p = port || 3030;
        config.port = p;
        rl.question("mongodb URI: ", function (uri) {
            if (uri) {
                config.mongodb = uri;
                rl.close();
            }
            else {
                rl.close();
                process.exit(1);
            }
        });
    });
});

rl.on("close", function () {
    fs.writeFileSync(path.join(configFolder, 'default.json'), JSON.stringify(config), 'utf8');
    process.exit(0);
});
