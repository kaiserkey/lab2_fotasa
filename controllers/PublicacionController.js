'use strict'

const { dbConfig } = require("../database/db_con")

module.exports = {

    async showAll(req,res){
        try {
            const ViewPosts = await dbConfig.Publicacion.findAll(
                {
                    where: {
                        usuario_id: req.params.id
                    },
                    include: ['imagen', 'etiquetas', 'comentarios', 'likes']
                }
            )
            
            if(ViewPosts){
                res.json(ViewPosts)
            }else{
                res.json(ViewPosts)
            }
        } catch (err) {
            res.json(err)
        }
    },

    async showOne(req,res){
        try {
            const ViewPosts = await dbConfig.Publicacion.findOne(
                {
                    where: {
                        id: req.query.id,
                        usuario_id: req.query.usuario_id
                    },
                    include: ['imagen', 'etiquetas', 'comentarios', 'likes']
                }
            )
            
            if(ViewPosts){
                res.json(ViewPosts)
            }else{
                res.json(ViewPosts)
            }
        } catch (err) {
            res.json(err)
        }
    },

    async create(req,res){
        try {
            const ImageCreate = await dbConfig.Imagen.create(
                {
                    nombre: req.body.nombre,
                    estado: req.body.estado,
                    formato: req.body.formato,
                    size: req.body.size,
                    resolucion: req.body.resolucion,
                    derechos: req.body.derechos,
                    usuario_id: req.body.usuario_id
                }
            ),
            PostCreate = await dbConfig.Publicacion.create( 
                {
                    titulo: req.body.titulo,
                    categoria: req.body.categoria,
                    fecha_creacion: req.body.fecha_creacion,
                    usuario_id: req.body.usuario_id,
                    imagen_id: ImageCreate.id,
                    etiquetas: [{ nombre: req.body.etiquetas }]
                },
                {
                    include: ['etiquetas']
                }
            )
            

            if(PostCreate){
                res.json(PostCreate)
            }else{
                res.json({error:"Error al cargar los datos"})
            }

        } catch (err) {
            res.json(err)
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