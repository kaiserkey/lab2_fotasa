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
        ValoracionController = require('../controllers/ValoracionController'),
        { body, validationResult } = require('express-validator')

        //vistas publicas
router.get( '/', ifSigned )

        //autenticacion
        .get('/signin', (req,res)=>{ res.render('Authenticate/signin') })
        .get('/signup', (req,res)=>{ res.render('Authenticate/signup') })
        .post('/signin', AuthController.signIn)
        .post('/signup', body('nombre').isLength({ min:3 }), 
                        body('apellido').isLength({ min:3 }),
                        body('email').isEmail(),
                        body('password').isLength({ min:3 }),
                        AuthController.signUp)
        
        //usuario
        .get( '/user/profile',routes_protect, UsuarioController.profile)
        .get( '/update/profile', routes_protect,UsuarioController.updateProfile)
        .post( '/update/profile',routes_protect, 
                                multerDefaultStorage('avatars').single('avatar'), 
                                body('nombre').isLength({ min:3 }), 
                                body('apellido').isLength({ min:3 }),
                                body('email').isEmail(),
                                body('password').isLength({ min:3 }),
                                body('nickname').isLength({ min:3 }),
                                body('intereses').isLength({ min:3 }),
                                body('ciudad').isLength({ min:3 }),
                                body('telefono').isLength({ min:10 }),
                                UsuarioController.update)
        .get('/user/logout', UsuarioController.logout)
        .post('/watermark/imagen', routes_protect, multerDefaultStorage('watermarks').single('watermark'), UsuarioController.addWatermark)
        .post('/watermark/texto', routes_protect, UsuarioController.addWatermark)
        .post('/watermark/delete', routes_protect, UsuarioController.deleteWatermark)
        .get( '/user/search',  routes_protect, UsuarioController.search)

        //publicaciones
        .get( '/post/user', routes_protect, PublicacionController.showUserPosts)
        .get( '/public', PublicacionController.showPublic)
        .get( '/public/search', PublicacionController.search)
        .get( '/public/show/:id', PublicacionController.showOnlyPublic)
        .get( '/post/new', routes_protect, PublicacionController.newView)
        .get( '/post/view',routes_protect, (req,res)=>{ res.render('Posts/viewpost', { user: req.user }) })
        .post( '/upload/public', routes_protect, 
                                multerDefaultStorage('public').single('image'), 
                                body('titulo').isLength({ min:3 }), 
                                body('estado').isLength({ min:3 }),
                                body('descripcion').isLength({ min:3 }),
                                body('derechos').isLength({ min:3 }),
                                body('categoria').isLength({ min:3 }),
                                body('etiquetas').isLength({ min:3 }),
                                PublicacionController.create)
        .post( '/upload/protected', routes_protect, 
                                multerDefaultStorage('private').single('image'),
                                body('titulo').isLength({ min:3 }), 
                                body('estado').isLength({ min:3 }),
                                body('descripcion').isLength({ min:3 }),
                                body('derechos').isLength({ min:3 }),
                                body('categoria').isLength({ min:3 }),
                                body('etiquetas').isLength({ min:3 }), 
                                PublicacionController.create)
        .get( '/home', routes_protect,  PublicacionController.showAll)
        .get( '/post/show/:id', routes_protect, PublicacionController.showOne)
        .get( '/post/update/:id',routes_protect, PublicacionController.viewUpdate)
        .post( '/post/update', routes_protect, PublicacionController.update)
        .post( '/post/delete', routes_protect, PublicacionController.delete)

        //comnetarios
        .post( '/post/comment',routes_protect, ComentarioController.create)

        //valoraciones
        .post( '/like', routes_protect, ValoracionController.create)

        //middleware errores
        .use( err404 )


module.exports = router