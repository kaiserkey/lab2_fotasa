'use strict'

const { dbConfig } = require("../database/db_con")

module.exports = {
    async create(req,res){
        try {
            const NewComment = await dbConfig.Comentario.create(
                {
                    descripcion: req.body.descripcion,
                    fecha: Date.now(),
                    usuario_id: req.body.usuario_id,
                    publicacion_id: req.body.publicacion_id
                }
            )

            if(NewComment){
                res.json(NewComment)
            }else{
                res.json({error:'No se pudo guardar los datos'})
            }
        } catch (err) {
            res.json(err)
        }
    },
    async update(req,res){
        try {
            const UpdateComment = await dbConfig.Comentario.update(
                {
                    descripcion: req.body.descripcion
                },
                {
                    where: {
                        id: req.body.id
                    }
                }
            )

            if(UpdateComment){
                res.json(UpdateComment)
            }else{
                res.json({error:'No se pudo guardar los datos'})
            }
        } catch (err) {
            res.json(err)
        }
    },
    async delete(req,res){
        try {
            const DeleteComment = await dbConfig.Comentario.destroy(
                {
                    where:{
                        id: req.params.id
                    }
                }
            )

            if(DeleteComment){
                res.json(DeleteComment)
            }else{
                res.json({error:'No se pudo guardar los datos'})
            }
        } catch (err) {
            res.json(err)
        }
    }
}