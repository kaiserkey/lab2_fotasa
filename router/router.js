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

router.get( '/home', routes_protect, (req,res)=>{ res.render('Users/index', { user: req.user }) } )
        //vistas publicas
        .get( '/', ifSigned )
        .get( '/public', (req,res)=>{ res.render('Public/home') })

        //autenticacion
        .get('/signin', (req,res)=>{ res.render('Authenticate/signin') })
        .get('/signup', (req,res)=>{ res.render('Authenticate/signup') })
        .post('/signin', AuthController.signIn)
        .post('/signup', AuthController.signUp)
        .get('/user/logout', UsuarioController.logout)
        //usuario
        .get( '/user/profile',routes_protect, UsuarioController.profile)
        .get( '/update/profile', routes_protect, UsuarioController.updateProfile)
        .post( '/update/profile',routes_protect, multerDefaultStorage('avatars').single('avatar'), UsuarioController.update)
        .get( '/home/:id', UsuarioController.show)
        //publicaciones
        .get( '/post/new', routes_protect, (req,res)=>{ res.render( 'Posts/newpost' , { user:req.user }) })
        .get( '/post/view',routes_protect, (req,res)=>{ res.render('Posts/viewpost', { user: req.user }) })
        .post( '/post/update',routes_protect, (req,res)=>{ res.render('Posts/updatepost', { user: req.user }) })
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