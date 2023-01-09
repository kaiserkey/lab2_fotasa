'use strict'

const { dbConfig } = require( '../database/db_con' ),
        bcrypt = require( 'bcrypt' ),
        jwt = require( 'jsonwebtoken' ),
        authConf = require( '../config/auth' ),
        { Op } = require( "sequelize" ),
        { body, validationResult } = require( 'express-validator' )

module.exports = {
    async signIn( req,res ){
        
        try {
            const {email, password} = req.body

            const user = await dbConfig.Usuario.findOne( 
                {
                    where: {
                        email: email,
                        password: {
                            [Op.ne]: null
                        }
                    }
                }
            )
            
            if( !user ){
                res.render( 'Authenticate/signin', { email: true } )
            }else{
                
                if( bcrypt.compareSync( password, user.password ) ){
                    //devolver token
                    const token = await jwt.sign( {user: user}, authConf.secret, {
                        expiresIn: authConf.expire
                    } )
                    //configurar la cookie
                    let options = {
                        path:"/",
                        sameSite:true,
                        maxAge: 1000 * 60 * 60 * 24, // would expire after 24 hours
                        httpOnly: true, // The cookie only accessible by the web server
                    }
                    res.cookie( 'x-access-token', token, options )
                    
                    res.redirect( '/home' ) 

                }else{
                    res.render( 'Authenticate/signin',{ password: true } )
                }
            }

        } catch ( err ) {
            console.log(err)
        }
    },

    async signUp( req,res ){
        const errors = validationResult( req )

        if ( !errors.isEmpty(  ) ) {
            if( errors.array(  )[0].param=='password' ){
                return res.render( 'Authenticate/signup', { err: 'password' } )
            }
            if( errors.array(  )[0].param=='email' ){
                return res.render( 'Authenticate/signup', { err: 'email' } )
            }
            if( errors.array(  )[0].param=='apellido' ){
                return res.render( 'Authenticate/signup', { err: 'apellido' } )
            }
            if( errors.array(  )[0].param=='nombre' ){
                return res.render( 'Authenticate/signup', { err: 'nombre' } )
            }
        }
        
        const fecha = new Date(), fecha_nacimiento = new Date(req.body.fecha_nacimiento)
        fecha.setFullYear(fecha.getFullYear() - 18)

        if( fecha_nacimiento > fecha ){
            return res.render( 'Authenticate/signup', { err: 'fecha' } )
        }

        const existUser = await dbConfig.Usuario.findOne( 
            {
                where: {
                    email: req.body.email
                }
            }
        )
        
        if( existUser ){
            res.render( 'Authenticate/signup', { existUser: true } )
        }else{
            try {
                const hashPassword = bcrypt.hashSync( req.body.password, parseInt( authConf.round ) )
        
                const user = await dbConfig.Usuario.create( 
                        {
                            nombre: req.body.nombre,
                            apellido: req.body.apellido,
                            email: req.body.email,
                            password: hashPassword,
                            intereses: req.body.intereses,
                            ciudad: req.body.ciudad,
                            telefono: req.body.telefono,
                            fecha_nacimiento: req.body.fecha_nacimiento
                        }
                )

                if( user ){
                    return res.render( 'Authenticate/signin', {registro: true} )
                }else{
                    return res.render( 'Authenticate/signup', {registro: false})
                }
            } catch (err) {
                console.log(err)
            }
        }
        
    },

    ifSigned( req, res ){
        if( !req.cookies['x-access-token'] ){
            return res.redirect( '/public' )
        }else{
            return res.redirect('/home')
        }
    }
}