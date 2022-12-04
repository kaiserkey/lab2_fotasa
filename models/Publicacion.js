'use strict'

const { Model } = require('sequelize')

module.exports = ( sequelize, DataTypes ) => 
{

  class Publicacion extends Model {
    
    static associate( models ) {
      Publicacion.belongsTo( models.Imagen, {as: 'imagen', foreignKey: 'imagen_id' , onDelete: 'CASCADE' , onUpdate: 'CASCADE'})
      Publicacion.belongsTo( models.Usuario )
      Publicacion.hasOne( models.Valoracion, { as: 'likes', foreignKey: 'publicacion_id' , onDelete: 'CASCADE'} )
      Publicacion.hasMany( models.Comentario, { as: 'comentarios', foreignKey: 'publicacion_id' , onDelete: 'CASCADE'} )
      Publicacion.hasMany( models.Etiqueta, { as: 'etiquetas', foreignKey: 'publicacion_id' , onDelete: 'CASCADE'} )
    }
  }
  
  Publicacion.init(
  {
    titulo: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    categoria: {
      type: DataTypes.ENUM('ninguno','colegio', 'juguetes', 'animales', 
                            'alimentos', 'ropa', 'frutas', 'transportes', 
                            'oficios', 'partes del cuerpo', 'muebles', 
                            'instrumentos musicales', 'flores'),
      defaultValue: 'ninguno'
    },
    fecha_creacion: {
      type: DataTypes.DATE,
      allowNull: false
    },
    descripcion:{
      type: DataTypes.STRING(200),
      allowNull: true
    }
  }, 
  {
    sequelize,
    modelName: 'Publicacion',
  })

  return Publicacion

}