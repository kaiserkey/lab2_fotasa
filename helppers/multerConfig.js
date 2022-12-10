'use strict'
    const multer = require("multer"),
        path = require("path"),
        minetypes = ['image/png','image/jpeg','image/jpg','image/webp','image/gif'],
        { v4:uuidv4 }= require("uuid")

module.exports = { 
    minetypes,

    multerDefaultStorage(route="private"){
        const storage = multer.diskStorage({
                            destination: path.join(__dirname, `../storage/${route}`),
                            filename: (req, file, cb)=>{
                                cb(null, uuidv4() + '.' + file.mimetype.split('/')[1])
                            }
                        }),
        upload = multer(
                    { 
                        storage: storage,
                    }
                )

        return upload
    }

}