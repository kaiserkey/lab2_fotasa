'use strict'

const { dbConfig } = require("../database/db_con")

module.exports = {

    async show(req,res){
        try {
            const user = await dbConfig.Usuario.findOne(
                {
                    where: {
                        id: req.params.id
                    }
                }
            )
            
            if(user){
                res.json(user)
            }else{
                res.json(user)
            }
        } catch (err) {
            res.json(err)
        }
    },

    async create(req,res){
        const user = await dbConfig.Usuario.create(
            {
                nombre: req.body.nombre,
                apellido: req.body.apellido,
                email: req.body.email,
                password: req.body.password,
                intereses: req.body.intereses,
                ciudad: req.body.ciudad,
                telefono: req.body.telefono,
                fecha_nacimiento: req.body.fecha_nacimiento
            }
        )

        if(user){
            res.json(user)
        }else{
            res.json({error: "No se cargaron los datos"})
        }
    },

    async update(req,res){
        try {
            const user = await dbConfig.Usuario.update(
                {
                    nombre: req.body.nombre,
                    apellido: req.body.apellido,
                    email: req.body.email,
                    password: req.body.password,
                    intereses: req.body.intereses,
                    ciudad: req.body.ciudad,
                    telefono: req.body.telefono,
                    fecha_nacimiento: req.body.fecha_nacimiento
                },
                {
                    where: {
                        id: req.body.id
                    }
                }

            )
    
            if(user){
                res.json(user)
            }else{
                res.json({error: "No se cargaron los datos"})
            }
        } catch (err) {
            res.json(err)
        }
    },

    logout(req,res){
        res.clearCookie('x-access-token')
        res.redirect('/')
    }

}