module.exports = {
    development: {
        port: process.env.PORT || 3000,
        privateKey: 'CUBE-WORKSHOP-SOFTUNI',
        databaseUrl: `mongodb+srv://user:${process.env.DB_PASSWORD}@cube-softuni-pw2ej.mongodb.net/cubicle?retryWrites=true&w=majority`
    },
    production: {}
};