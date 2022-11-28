multer = require("multer"),
        path = require("path"),
        { v4:uuidv4 } = require("uuid"),
        storage = multer.diskStorage(
            {
                destination: path.join(__dirname, '../storage'),
                filename: (req, file, cb)=>{
                    cb(null, uuidv4() + '.' + file.mimetype.split('/')[1])
                }
            }
        ),
        mimetype = ['image/png','image/jpeg','image/jpg','image/webp','image/gif'],
        upload = multer(
            { 
                storage: storage,
            }
        )

module.exports = { upload, mimetype }