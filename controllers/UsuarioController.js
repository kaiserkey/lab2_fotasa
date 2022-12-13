'use strict'

const { dbConfig } = require("../database/db_con"),
        { transformOnlyDate, onlyDateUpdateUser } = require('../helppers/helppers'),
        bcrypt = require( 'bcrypt' ),
        fs = require("fs"),
        path = require('path'),
        authConf = require( '../config/auth' )

module.exports = {

    profile(req,res){ 
        res.render( 'Users/userprofile' , { user:req.user, dateFormat: transformOnlyDate }) 
    },

    updateProfile(req,res){ 
        res.render( 'Users/updateuser' , { user:req.user, dateFormat: onlyDateUpdateUser }) 
    },
    
    async addWatermark(req,res){
        try {
            const Watermark = await dbConfig.Watermark.create(
                {
                    tipo: req.body.tipo,
                    marca: req.file ? req.file.filename : req.body.watermark,
                    usuario_id: req.user.id
                }
            )
            if(Watermark){
                res.redirect( '/user/profile' )
            }
        } catch (err) {
            console.log(err)
        }
    },

    async deleteWatermark(req,res){
        try {
            if(req.user.watermark.tipo == "imagen"){
                fs.unlinkSync(path.join(__dirname, `../storage/watermarks/${req.user.watermark.marca}`))
            }
            const DeleteWatermark = await dbConfig.Watermark.destroy(
                {
                    where: {
                        id: req.body.watermark_id
                    }
                }
            )
            if(DeleteWatermark){
                res.redirect( '/user/profile' )
            }
        } catch (err) {
            console.log(err)
        }
    },

    async update(req,res){
        try {
            //si el password es el mismo
            if(bcrypt.compareSync( req.body.password, req.user.password )){
                req.body.password = req.user.password
            }else{//sino generamos otro
                req.body.password = bcrypt.hashSync( req.body.password, parseInt( authConf.round ) )
            }
            
            if(req.user.avatar){
                fs.unlinkSync(path.join(__dirname, `../storage/avatars/${req.user.avatar}`))
            }
            
            const user = await dbConfig.Usuario.update(
                {
                    nombre: req.body.nombre,
                    apellido: req.body.apellido,
                    email: req.body.email,
                    password: req.body.password,
                    intereses: req.body.intereses,
                    ciudad: req.body.ciudad,
                    telefono: req.body.telefono,
                    fecha_nacimiento: req.body.fecha_nacimiento,
                    avatar: (req.file.filename) ? req.file.filename : null,
                    nickname: req.body.nickname
                },
                {
                    where: {
                        id: req.user.id
                    }
                }
            )
    
            if(user){
                res.redirect('/user/profile')
            }else{
                res.json({error: "Error al cargar los datos!"})
            }
        } catch (err) {
            console.log(err)
        }
    },

    logout(req,res){
        res.clearCookie('x-access-token')
        res.redirect('/')
    },
}