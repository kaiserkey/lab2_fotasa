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
    }
}