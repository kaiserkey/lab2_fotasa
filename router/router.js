'use strict'
const express = require('express'),
        router = express.Router(),
        { err404 } = require('../helppers/helppers')

router.get( '/', (req,res)=>{ res.render('index') } )
        .use( err404 )


module.exports = router