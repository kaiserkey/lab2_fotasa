'use strict'

const { Model } = require('sequelize')

module.exports = ( sequelize, DataTypes ) => 
  {
    class Etiqueta extends Model {
      static associate(models) {
        Etiqueta.belongsTo(models.Publicacion, { foreignKey: 'publicacion_id' })
      }
  }

  Etiqueta.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    nombre: {
      type: DataTypes.STRING(80),
      allowNull: false
    }
  }, 
  {
    sequelize,
    modelName: 'Etiqueta',
  })

  return Etiqueta

}