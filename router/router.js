'use strict'

const express = require('express'),
        router = express.Router(),
        { err404 } = require('../helppers/helppers'),
        UsuarioController = require('../controllers/UsuarioController'),
        PublicacionController = require('../controllers/PublicacionController')

router.get( '/', (req,res)=>{ res.render('index') } )
        //usuario
        .post( '/signup', UsuarioController.create)
        .get( '/home/:id', UsuarioController.show)
        .post( '/update', UsuarioController.update)
        //publicaciones
        .post( '/post/create', PublicacionController.create)
        .get( '/post/show/:id', PublicacionController.showAll)
        .get( '/post/showone/:id', PublicacionController.showOne)
        .post( '/post/update', PublicacionController.update)
        .get( '/post/delete/:id', PublicacionController.delete)
        //middleware errores
        .use( err404 )


module.exports = router