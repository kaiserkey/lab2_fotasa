'use strict'

const express = require('express'),
        router = express.Router(),
        { err404 } = require('../helppers/helppers'),
        { ifSigned } = require('../controllers/AuthController'),
        { multerDefaultStorage } = require('../helppers/multerConfig'),
        AuthController = require('../controllers/AuthController'),
        routes_protect = require('../middlewares/routes_protect'),
        UsuarioController = require('../controllers/UsuarioController'),
        PublicacionController = require('../controllers/PublicacionController'),
        ComentarioController = require('../controllers/ComentarioController'),
        ValoracionController = require('../controllers/ValoracionController')

        //vistas publicas
router.get( '/', ifSigned )

        //autenticacion
        .get('/signin', (req,res)=>{ res.render('Authenticate/signin') })
        .get('/signup', (req,res)=>{ res.render('Authenticate/signup') })
        .post('/signin', AuthController.signIn)
        .post('/signup', AuthController.signUp)
        
        //usuario
        .get( '/user/profile',routes_protect, UsuarioController.profile)
        .get( '/update/profile', routes_protect, UsuarioController.updateProfile)
        .post( '/update/profile',routes_protect, multerDefaultStorage('avatars').single('avatar') , UsuarioController.update)
        .get('/user/logout', UsuarioController.logout)

        //publicaciones
        .get( '/public', PublicacionController.showPublic)
        .get( '/public/show/:id', PublicacionController.showOnlyPublic)
        .get( '/post/new', routes_protect, PublicacionController.newView)
        .get( '/post/view',routes_protect, (req,res)=>{ res.render('Posts/viewpost', { user: req.user }) })
        .post( '/post/update',routes_protect, (req,res)=>{ res.render('Posts/updatepost', { user: req.user }) })
        .post( '/upload/public', routes_protect, multerDefaultStorage('public').single('image'), PublicacionController.create)
        .post( '/upload/protected', routes_protect, multerDefaultStorage('private').single('image'), PublicacionController.create)
        .get( '/home', routes_protect,  PublicacionController.showAll)
        .get( '/post/show/:id', routes_protect, PublicacionController.showOne)

        .post( '/post/update', routes_protect, PublicacionController.update)
        .post( '/post/delete', routes_protect, PublicacionController.delete)
        //comnetarios
        .post( '/post/comment',routes_protect, ComentarioController.create)

        //valoraciones
        .post( '/like', routes_protect, ValoracionController.create)

        //middleware errores
        .use( err404 )


module.exports = router