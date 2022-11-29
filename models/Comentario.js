'use strict'

const { Model } = require('sequelize')

module.exports = ( sequelize, DataTypes ) => 
  {
    class Comentario extends Model {
      static associate(models) {
        Comentario.belongsTo(models.Usuario)
        Comentario.belongsTo(models.Publicacion)
      }
  }

  Comentario.init(
  {
    descripcion: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, 
  {
    sequelize,
    modelName: 'Comentario',
  })

  return Comentario

}