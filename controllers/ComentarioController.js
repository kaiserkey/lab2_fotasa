'use strict'

const { dbConfig } = require("../database/db_con")

module.exports = {
    async create(req,res){
        try {
            const NewComment = await dbConfig.Comentario.create(
                {
                    descripcion: req.body.descripcion,
                    fecha: Date.now(),
                    usuario_id: req.user.id,
                    publicacion_id: req.body.publicacion_id
                }
            )

            if(NewComment){
                res.redirect(`/post/show/${req.body.publicacion_id}`)
            }else{
                console.log('No se pudo guardar los datos')
            }
        } catch (err) {
            console.log(err)
        }
    }
}