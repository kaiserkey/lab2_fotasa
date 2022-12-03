const jwt = require('jsonwebtoken'),
        auth = require('../config/auth'),
        { dbConfig } = require('../database/db_con')

module.exports = (req, res, next)=>{
        if( !req.cookies['x-access-token']){
            res.render('Errors/error401')
        }else{
            //comprobar la validez del token
            const token = req.cookies['x-access-token']
            
            jwt.verify(token, auth.secret, (err, decoded)=>{
                if(err){
                    res.render('Errors/error1020')
                }else{
                    dbConfig.Usuario.findByPk( decoded.user.id ).then(
                        user => {
                            req.user = user
                            next()
                        }
                    )
                }
            })
            
        } 
    
}