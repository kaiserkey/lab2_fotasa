'use strict'

const { dbConfig } = require("../database/db_con")

module.exports = {
    async create(req,res){
        try {
            const NewLike = await dbConfig.Valoracion.create(
                {
                    estrellas: req.body.estrellas,
                    usuario_id: req.user.id,
                    publicacion_id: req.body.publicacion_id
                }
            )

            if(NewLike){
                res.redirect( `/post/show/${req.body.publicacion_id}` )
            }else{
                console.log("Error no se pueden guardar los datos")
            }
        } catch (err) {
            console.log(err)
        }
    },

    async update(req,res){
        try {
            const UpdateLike = await dbConfig.Valoracion.update(
                {
                    estrellas: req.body.estrellas
                },
                {
                    where: {
                        id: req.body.id
                    }
                }
            )

            if(UpdateLike){
                res.json(UpdateLike)
            }else{
                res.json({error:'No se pudo guardar los datos'})
            }
        } catch (err) {
            res.json(err)
        }
    },
    
    async delete(req,res){
        try {
            const DeleteLike = await dbConfig.Valoracion.destroy(
                {
                    where:{
                        id: req.params.id
                    }
                }
            )

            if(DeleteLike){
                res.json(DeleteLike)
            }else{
                res.json({error:'No se pudo guardar los datos'})
            }
        } catch (err) {
            res.json(err)
        }
    }
}