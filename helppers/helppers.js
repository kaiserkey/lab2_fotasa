module.exports = {

    transformOnlyDate(fecha=null){

        let date = new Date(fecha)

        if(date){
            const addZero = (num)=>
            {
                return (num<10) ? '0'+num : num
            },
            dia = addZero(date.getDate()),
            mes = addZero(date.toLocaleDateString("es-ES").split('/')[1]),
            anno = date.getFullYear(),

            fecha = `${dia}/${mes}/${anno}`
            
            return fecha
        }else{
            return null
        }
    },

    transformDates(fecha=null){
        let date = new Date(fecha)
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
        res.render('Errors/error404')
        next()
    }

}