'use strict'

const { dbConfig } = require("../database/db_con"),
        { transformDates } = require('../helppers/helppers'),
        fs = require("fs"),
        path = require('path'),
        { Op } = require( "sequelize" ),
        Sequelize = require("sequelize"),
        watermark = require('jimp-watermark'),
        { body, validationResult } = require('express-validator')


module.exports = {

    newView(req,res){ 
        res.render( 'Posts/newpost' , { user:req.user }) 
    },

    async search(req,res){
        try {
            const SearchPosts = await dbConfig.Etiqueta.findAll(
                {
                    include:
                        {
                            association: 'publicaciones'
                        },
                    limit: 35,
                    order: Sequelize.literal('rand()'),
                    where: {
                        nombre: {
                            [Op.substring]: req.query.search.toLowerCase()
                        }
                    }
                }
            ),
            PostsList = []

            for (let i = 0; i < SearchPosts.length; i++) {
                const Post = await dbConfig.Publicacion.findOne(
                    {
                        include: {
                            association: 'imagen',
                            where: {
                                estado: 'publico'
                            }
                        },
                        where: {
                            id: SearchPosts[i].publicaciones.id
                        }
                    }
                )
                if(Post!=null){
                    PostsList.push(
                        Post
                    )
                }
                
            }
            // res.json(PostsList)
            if(SearchPosts){
                res.render( 'Public/search', { posts: PostsList } )
            }
        } catch (err) {
            console.log(err)
        }
    },

    async showUserPosts(req,res){
        const by = req.query.by || 'titulo',
                order = req.query.order || 'DESC'//ASC
        try {
            const SearchPosts = await dbConfig.Publicacion.findAll(
                {
                    order: [
                        [by, order],
                    ],
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

            //destacados 
            const ultimaSemana = new Date()
            ultimaSemana.setMonth(ultimaSemana.getDay() - 7)

            const SearchDistinctPosts = await dbConfig.Publicacion.findAll(
                {
                    attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('id')),'id']],
                    where: {
                        fecha_creacion: {
                            [Op.gt]: ultimaSemana
                        }
                    }
                }
            ),
            BestPosts = []
            
            for (let i = 0; i < SearchDistinctPosts.length; i++) {
                const SearchBestPosts = await dbConfig.Publicacion.findOne(
                    {
                        include: [
                            {
                                association: 'likes',
                                where: {
                                    estrellas: {
                                        [Op.gte]: 4
                                    }
                                }
                            },
                            {
                                association: 'imagen',
                            }
                        ],
                        where: {
                            id: SearchDistinctPosts[i].id
                        }
                    }
                )
                if(SearchBestPosts != null){
                    BestPosts.push(
                        SearchBestPosts
                    )
                }
            }

            const destacados = []

            for (let i = 0; i < BestPosts.length; i++) {
                if(destacados.length == 5){
                    break
                }
                const sum = await dbConfig.Valoracion.sum('estrellas', { where: { publicacion_id:  BestPosts[i].id} })
                const count = await dbConfig.Valoracion.count({ where: { publicacion_id:  BestPosts[i].id } })

                if(count>=5 && ((sum/count)>=4)){
                    destacados.push(
                        BestPosts[i]
                    )
                }
            }

            if(ViewPosts){
                res.render( 'Users/index', { user: req.user,  posts: ViewPosts, best: destacados})
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

        const errors = validationResult( req )

        if ( !errors.isEmpty(  ) ) {
            if( errors.array(  )[0].param=='titulo' ){
                if(req.body.estado == 'publico'){
                    if(req.file){
                        fs.unlinkSync(path.join(__dirname, `../storage/public/${req.file.filename}`))
                    }
                }
                if(req.body.estado == 'protegido'){
                    if(req.file){
                        fs.unlinkSync(path.join(__dirname, `../storage/private/${req.file.filename}`))
                    }
                }
                return res.render('Posts/newpost', { user: req.user, err: 'titulo' })
            }
            if( errors.array(  )[0].param=='estado' ){
                if(req.body.estado == 'publico'){
                    if(req.file){
                        fs.unlinkSync(path.join(__dirname, `../storage/public/${req.file.filename}`))
                    }
                }
                if(req.body.estado == 'protegido'){
                    if(req.file){
                        fs.unlinkSync(path.join(__dirname, `../storage/private/${req.file.filename}`))
                    }
                }
                return res.render('Posts/newpost', { user: req.user, err: 'estado' })
            }
            if( errors.array(  )[0].param=='descripcion' ){
                if(req.body.estado == 'publico'){
                    if(req.file){
                        fs.unlinkSync(path.join(__dirname, `../storage/public/${req.file.filename}`))
                    }
                }
                if(req.body.estado == 'protegido'){
                    if(req.file){
                        fs.unlinkSync(path.join(__dirname, `../storage/private/${req.file.filename}`))
                    }
                }
                return res.render('Posts/newpost', { user: req.user, err: 'descripcion' })
            }
            if( errors.array(  )[0].param=='descripcion' ){
                if(req.body.estado == 'publico'){
                    if(req.file){
                        fs.unlinkSync(path.join(__dirname, `../storage/public/${req.file.filename}`))
                    }
                }
                if(req.body.estado == 'categoria'){
                    if(req.file){
                        fs.unlinkSync(path.join(__dirname, `../storage/private/${req.file.filename}`))
                    }
                }
                return res.render('Posts/newpost', { user: req.user, err: 'categoria' })
            }
            if( errors.array(  )[0].param=='derechos' ){
                if(req.body.estado == 'publico'){
                    if(req.file){
                        fs.unlinkSync(path.join(__dirname, `../storage/public/${req.file.filename}`))
                    }
                }
                if(req.body.estado == 'categoria'){
                    if(req.file){
                        fs.unlinkSync(path.join(__dirname, `../storage/private/${req.file.filename}`))
                    }
                }
                return res.render('Posts/newpost', { user: req.user, err: 'derechos' })
            }
            if( errors.array(  )[0].param=='etiquetas' ){
                if(req.body.estado == 'publico'){
                    if(req.file){
                        fs.unlinkSync(path.join(__dirname, `../storage/public/${req.file.filename}`))
                    }
                }
                if(req.body.estado == 'categoria'){
                    if(req.file){
                        fs.unlinkSync(path.join(__dirname, `../storage/private/${req.file.filename}`))
                    }
                }
                return res.render('Posts/newpost', { user: req.user, err: 'etiquetas' })
            }
        }

        if(!req.file){
            return res.render('Posts/newpost', { user: req.user, err: 'image' })
        }

        try {
            if(req.body.estado == "publico"){
                const options = {
                    'ratio': 0.6,
                    'opacity': 0.6,
                    'dstPath': `./storage/publics_watermarks/${req.file.filename}`
                }

                watermark.addWatermark(path.join(__dirname, `../storage/public/${req.file.filename}`), 
                                        path.join(__dirname, `../publics/img/watermark.png`), 
                                        options)
            }

            if(req.body.estado == "protegido" && req.user.watermark){
                if(req.user.watermark.tipo == "imagen"){
                    const options = {
                        'ratio': 0.6,
                        'opacity': 0.6,
                        'dstPath': `./storage/private/${req.file.filename}`
                    }
        
                    watermark.addWatermark(path.join(__dirname, `../storage/private/${req.file.filename}`), 
                                            path.join(__dirname, `../storage/watermarks/${req.user.watermark.marca}`), 
                                            options)
                }
                if(req.user.watermark.tipo == "texto"){
                    const options = {
                        'text': req.user.watermark.marca,
                        'textSize': 8,
                        'dstPath': `./storage/private/${req.file.filename}`
                    }
        
                    watermark.addTextWatermark(path.join(__dirname, `../storage/private/${req.file.filename}`), 
                                            options)
                }
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
                    etiquetas: [{ nombre: req.body.etiquetas.toLowerCase() }]
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
                fs.unlinkSync(path.join(__dirname, `../storage/publics_watermarks/${DeleteImageFile.nombre}`))
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