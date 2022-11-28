'use strict'

const express = require( 'express' ),
        app = express(),
        morgan = require( 'morgan' ),
        router = require( './router/router' ),
        port = process.env.HTTP_PORT  || 4000,
        publicDir = express.static( `${ __dirname }/publics` ),
        publicStorage = express.static( `${ __dirname }/storage` ),
        viewDir = (`${__dirname}/views`),
        cookieParser = require( 'cookie-parser' ),
        { connection } = require( './database/db_con' )


        app.set( 'port', port )
            .use( morgan('dev') )
            .set( 'view engine','pug' )
            .set( 'views',viewDir )
            .use( express.json() )
            .use( express.urlencoded({extended:false}) )
            .use( cookieParser() )
            .use( publicDir )
            .use( publicStorage )
            .use( router )

            .listen(app.get("port"), ()=>{
                console.log(`Iniciado el servidor en el puerto ${ app.get("port") }`)
                connection.con()
            })