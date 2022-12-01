'use strict'

const express = require('express'),
        router = express.Router(),
        { err404 } = require('../helppers/helppers'),
        UsuarioController = require('../controllers/UsuarioController'),
        PublicacionController = require('../controllers/PublicacionController'),
        ComentarioController = require('../controllers/ComentarioController'),
        ValoracionController = require('../controllers/ValoracionController')

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
        //comnetarios
        .post( '/comment/create', ComentarioController.create)
        .post( '/comment/update', ComentarioController.update)
        .get( '/comment/delete/:id', ComentarioController.delete)
        //valoraciones
        .post( '/like/create', ValoracionController.create)
        .post( '/like/update', ValoracionController.update)
        .get( '/like/delete/:id', ValoracionController.delete)
        //middleware errores
        .use( err404 )


module.exports = router