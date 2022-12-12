'use strict'

const { dbConfig } = require("../database/db_con"),
        { transformOnlyDate, transformDates } = require('../helppers/helppers'),
        fs = require("fs"),
        path = require('path'),
        { Op } = require( "sequelize" ),
        Sequelize = require("sequelize"),
        { rename } = require('fs/promises'),
        watermark = require('jimp-watermark')


module.exports = {

    newView(req,res){ 
        res.render( 'Posts/newpost' , { user:req.user }) 
    },

    async showUserPosts(req,res){
        try {
            const SearchPosts = await dbConfig.Publicacion.findAll(
                {
                    include: ['imagen'],
                    where: {
                        usuario_id: req.user.id
                    }
                }
            )
            
            if(SearchPosts){
                res.render( 'Users/userposts', { user: req.user,  posts: SearchPosts})
            }
        } catch (err) {
            console.log(err)
        }
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
                            }
                        ],
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
                    attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('usuario_id')),'usuario_id']],
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
                        include: ['imagen'],
                        where: {
                            usuario_id: SearchPosts[i].usuario_id
                        }
                    }
                )
                ViewPosts.push( Post )
            }
            
            if(ViewPosts){
                res.render( 'Users/index', { user: req.user,  posts: ViewPosts})
            }
        } catch (err) {
            console.log(err)
        }
    },

    async showOnlyPublic(req,res){
        try {
            const SearchPost = await dbConfig.Publicacion.findOne(
                {
                    where: {
                        id: req.params.id
                    },
                    include: ['imagen', 'etiquetas', 'usuarios', 'likes']
                }
            ),
            Comments = await dbConfig.Comentario.findAll(
                {
                    include: ['usuario'],
                    where: {
                        publicacion_id: req.params.id
                    }
                }
            )

            const sum = await dbConfig.Valoracion.sum('estrellas', { where: { publicacion_id:  req.params.id} })
            const count = await dbConfig.Valoracion.count({ where: { publicacion_id:  req.params.id} })

            
            if(SearchPost){
                res.render( 'Posts/viewpublic', { post:SearchPost,  sum: sum>0 ? sum : 0, count:count, 
                                                format: transformDates, comment: Comments.length>0 ? true : false,
                                                comentarios: Comments})
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
                    include: ['imagen', 'etiquetas', 'usuarios']
                }
            ),
            SearchLike = await dbConfig.Valoracion.findOne(
                {
                    where: {
                        usuario_id: req.user.id,
                        publicacion_id: req.params.id
                    }
                }
            ),
            Comments = await dbConfig.Comentario.findAll(
                {
                    include: ['usuario'],
                    where: {
                        publicacion_id: req.params.id
                    }
                }
            )
            

            const sum = await dbConfig.Valoracion.sum('estrellas', { where: { publicacion_id:  req.params.id} })
            const count = await dbConfig.Valoracion.count({ where: { publicacion_id:  req.params.id} })

            
            if(SearchPost){
                res.render( 'Posts/viewpost', { user:req.user, post:SearchPost,  sum: sum>0 ? sum : 0, count:count, 
                                                format: transformDates, comment: Comments.length>0 ? true : false,
                                                myLike: SearchLike, comentarios: Comments })
            }else{
                console.log("Error al cargar los datos")
            }
        } catch (err) {
            console.log(err)
        }
    },

    async create(req,res){
        try {
            //TODO: terminar de hacer  la marca de agua
            if(req.body.estado == "publico"){
                const options = {
                    'ratio': 0.6,
                    'opacity': 0.6,
                    'dstPath': `./storage/public/${req.file.filename}`
                }
    
                watermark.addWatermark(path.join(__dirname, `../storage/public/${req.file.filename}`), 
                                        path.join(__dirname, `../publics/img/watermark.png`), 
                                        options)
            }

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

    async viewUpdate(req,res){
        try {
            const SearchPost = await dbConfig.Publicacion.findOne(
                {
                    where: {
                        id: req.params.id
                    },
                    include: ['imagen', 'etiquetas']
                }
            )
            
            res.render('Posts/updatepost', { user: req.user, post: SearchPost })
        } catch (err) {
            console.log(err)
        }
    },

    async update(req,res){
        try {
            const Image = await dbConfig.Imagen.findOne(
                {
                    where: {
                        id: req.body.imagen_id
                    }
                }
            )

            if(req.body.estado != Image.estado){
                if(req.body.estado == "publico"){
                    const from = path.join(__dirname, `../storage/private/${Image.nombre}`)
                    const to = path.join(__dirname, `../storage/public/${Image.nombre}`)

                    try {
                        await rename(from, to);
                        console.log(`Moved ${from} to ${to}`);
                    } catch (err) {
                        console.log(err);
                    }
                }

                if(req.body.estado == "protegido"){
                    const from = path.join(__dirname, `../storage/public/${Image.nombre}`)
                    const to = path.join(__dirname, `../storage/private/${Image.nombre}`)

                    try {
                        await rename(from, to);
                        console.log(`Moved ${from} to ${to}`);
                    } catch (err) {
                        console.log(err);
                    }
                }
            }

            const PostUpdate = await dbConfig.Publicacion.update(
                {
                    titulo: req.body.titulo,
                    categoria: req.body.categoria,
                    descripcion: req.body.descripcion
                },
                {
                    where: {
                        id: req.body.publicacion_id
                    }
                }
            ),
            TagUpdate = await dbConfig.Etiqueta.update(
                {
                    nombre: req.body.etiquetas
                },
                {
                    where: {
                        publicacion_id: req.body.publicacion_id
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
                        id: req.body.imagen_id
                    }
                }
            )
            

            if(PostUpdate && TagUpdate && ImageUpdate){
                res.redirect(`/post/show/${req.body.publicacion_id}`)
            }
        } catch (err) {
            console.log(err)
        }
    },

    async delete(req,res){
        try {
            const DeleteImageFile = await dbConfig.Imagen.findOne({ where: { id: req.body.imagen_id } }) 
            
            if(DeleteImageFile.estado == 'publico'){
                fs.unlinkSync(path.join(__dirname, `../storage/public/${DeleteImageFile.nombre}`))
            }

            if(DeleteImageFile.estado == 'protegido'){
                fs.unlinkSync(path.join(__dirname, `../storage/private/${DeleteImageFile.nombre}`))
            }

            const DeleteOnCascade = await dbConfig.Imagen.destroy({ where: { id: req.body.imagen_id } }) 

            if( DeleteOnCascade ){
                res.redirect( '/home' )
            }else{
                console.log( "No se pudo eliminar" )
            }
        } catch (err) {
            console.log(err)
        }
    }

}