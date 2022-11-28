module.exports = {

    transformDates(date=null){
        if(date){
            const addZero = (num)=>
            {
                return (num<10) ? '0'+num : num
            },
            rango = ()=>
            {
                return (date.getHours()<12) ? 'AM' : 'PM'
            },
            hrs = addZero(date.getHours()),
            min = addZero(date.getMinutes()),
            sec = addZero(date.getSeconds()),
            dia = addZero(date.getDate()),
            mes = addZero(date.getMonth()),
            anno = date.getFullYear(),

            fecha = `${dia}/${mes}/${anno}`,
            hora = `${hrs}:${min}:${sec} ${rango()}`

            return fecha + " " + hora
        }else{
            return null
        }
    },

    err404(req, res, next){
        res.render('error', { msg: 'Error 404 - Recurso no encontrado' })
        next()
    }

}