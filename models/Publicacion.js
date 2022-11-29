'use strict'

const { Model } = require('sequelize')

module.exports = ( sequelize, DataTypes ) => 
{

  class Publicacion extends Model {
    
    static associate(models) {
      Publicacion.belongsTo(models.Imagen)
      Publicacion.hasOne(models.Valoracion, { as: 'publicacion_likes', foreignKey: 'publicacion_id'})
      Publicacion.hasMany(models.Comentario, { as: 'publicacion_comentarios', foreignKey: 'publicacion_id' })
      Publicacion.hasMany(models.Etiqueta, { as: 'etiquetas', foreignKey: 'publicacion_id' })
      Publicacion.belongsTo(models.Usuario)
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
    }
  }, 
  {
    sequelize,
    modelName: 'Publicacion',
  })

  return Publicacion

}