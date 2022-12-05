'use strict'

const { dbConfig } = require("../database/db_con"),
        { transformOnlyDate, transformDates } = require('../helppers/helppers'),
        fs = require("fs"),
        path = require('path'),
        { Op, where } = require( "sequelize" ),
        Sequelize = require("sequelize")


module.exports = {

    newView(req,res){ 
        res.render( 'Posts/newpost' , { user:req.user }) 
    },

    async showPublic(req, res){
        try {
            let fecha = new Date()
            fecha.setMonth(fecha.getMonth() - 12)
            const SearchPosts = await dbConfig.Publicacion.findAll(
                {
                    attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('usuario_id')) ,'usuario_id']],
                    limit: 35,
                    order: Sequelize.literal('rand()'),
                    where: {
                        fecha_creacion: {
                            [Op.gt]: fecha
                        } 
                    }
                }
            ),
            ViewPosts = []

            for (let i = 0; i < SearchPosts.length; i++) {
                const Post = await dbConfig.Publicacion.findOne(
                    {
                        include: [
                            {
                                association: 'imagen',
                                where: {
                                    estado: 'publico'
                                }
                            }, 
                            {
                                association: 'likes'
                            }],
                        where: {
                            usuario_id: SearchPosts[i].usuario_id,
                        }
                    }
                )
                if(Post){
                    ViewPosts.push( Post )
                }
            }
            
            if(ViewPosts){
                res.render( 'Public/home', { posts: ViewPosts })
            }else{
                console.log("Error al cargar los datos")
            }

        } catch (err) {
            console.log(err)
        }
    },

    async showAll(req,res){
        try {
            let fecha = new Date()
            fecha.setMonth(fecha.getMonth() - 12)
            const SearchPosts = await dbConfig.Publicacion.findAll(
                {
                    attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('usuario_id')) ,'usuario_id']],
                    limit: 35,
                    order: Sequelize.literal('rand()'),
                    where: {
                        fecha_creacion: {
                            [Op.gt]: fecha
                        } 
                    }
                }
            ),
            ViewPosts = []

            for (let i = 0; i < SearchPosts.length; i++) {
                const Post = await dbConfig.Publicacion.findOne(
                    {
                        include: ['imagen', 'likes'],
                        where: {
                            usuario_id: SearchPosts[i].usuario_id
                        }
                    }
                )
                ViewPosts.push( Post )
            }
            
            if(ViewPosts){
                res.render( 'Users/index', { user: req.user,  posts: ViewPosts})
            }else{
                res.json(ViewPosts)
            }
        } catch (err) {
            res.json(err)
        }
    },

    async showOnlyPublic(req,res){
        try {
            const SearchPost = await dbConfig.Publicacion.findOne(
                {
                    where: {
                        id: req.params.id
                    },
                    include: ['imagen', 'etiquetas', 'comentarios', 'likes']
                }
            )

            const sum = await dbConfig.Valoracion.sum('estrellas', { where: { publicacion_id:  req.params.id} })
            const count = await dbConfig.Valoracion.count({ where: { publicacion_id:  req.params.id} })

            
            if(SearchPost){
                res.render( 'Posts/viewpublic', { post:SearchPost,  sum: sum>0 ? sum : 0, count:count, 
                                                format: transformDates, comment: SearchPost.comentarios.length>0 ? true : false})
            }else{
                console.log("Error al cargar los datos")
            }
        } catch (err) {
            console.log(err)
        }
    },

    async showOne(req,res){
        try {
            const SearchPost = await dbConfig.Publicacion.findOne(
                {
                    where: {
                        id: req.params.id
                    },
                    include: ['imagen', 'etiquetas', 'comentarios', 'likes']
                }
            ),
            SearchLike = await dbConfig.Valoracion.findOne(
                {
                    where: {
                        usuario_id: req.user.id,
                        publicacion_id: req.params.id
                    }
                }
            )

            const sum = await dbConfig.Valoracion.sum('estrellas', { where: { publicacion_id:  req.params.id} })
            const count = await dbConfig.Valoracion.count({ where: { publicacion_id:  req.params.id} })

            
            if(SearchPost){
                res.render( 'Posts/viewpost', { user:req.user, post:SearchPost,  sum: sum>0 ? sum : 0, count:count, 
                                                format: transformDates, comment: SearchPost.comentarios.length>0 ? true : false,
                                                myLike: SearchLike })
            }else{
                console.log("Error al cargar los datos")
            }
        } catch (err) {
            console.log(err)
        }
    },

    async create(req,res){
        try {

            const ImageCreate = await dbConfig.Imagen.create(
                {
                    nombre: req.file.filename,
                    estado: req.body.estado,
                    formato: req.file.mimetype,
                    size: req.file.size,
                    resolucion: req.body.resolucion,
                    derechos: req.body.derechos,
                    usuario_id: req.user.id
                }
            ),
            PostCreate = await dbConfig.Publicacion.create( 
                {
                    titulo: req.body.titulo,
                    descripcion: req.body.descripcion,
                    categoria: req.body.categoria,
                    fecha_creacion: Date.now(),
                    usuario_id: req.user.id,
                    imagen_id: ImageCreate.id,
                    etiquetas: [{ nombre: req.body.etiquetas }]
                },
                {
                    include: ['etiquetas']
                }
            )
            

            if(PostCreate){
                res.redirect( '/home' )
            }else{
                console.log("Error al cargar los datos")
            }

        } catch (err) {
            console.log(err)
        }
    },

    async update(req,res){
        try {
            const PostUpdate = await dbConfig.Publicacion.update(
                {
                    titulo: req.body.titulo,
                    categoria: req.body.categoria
                },
                {
                    where: {
                        id: req.body.id
                    }
                }
            ),
            id = await dbConfig.Publicacion.findOne(
                {
                    attributes: ['imagen_id'],
                    where: {
                        id: req.body.id
                    }
                }
            ),
            ImageUpdate = await dbConfig.Imagen.update(
                {
                    estado: req.body.estado,
                    derechos: req.body.derechos
                },
                {
                    where: {
                        id: id.imagen_id
                    }
                }
            )

            if(PostUpdate && ImageUpdate){
                res.json({ PostUpdate, ImageUpdate })
            }else{
                res.json({error: "No se cargaron los datos"})
            }
        } catch (err) {
            res.json(err)
        }
    },

    async delete(req,res){
        try {
            const DeleteOnCascade = await dbConfig.Imagen.destroy({ where: { id: req.params.id } }) 
            
            if( DeleteOnCascade ){
                res.json( { DeleteOnCascade } )
            }else{
                res.json( { error: "No se pudo eliminar" } )
            }
        } catch (err) {
            res.json(err)
        }
    }

}