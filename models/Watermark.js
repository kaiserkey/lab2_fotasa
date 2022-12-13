'use strict'

const { Model } = require('sequelize')

module.exports = ( sequelize, DataTypes ) => 
  {
    class Watermark extends Model {
      static associate(models) {
        Watermark.belongsTo(models.Usuario)
      }
  }

  Watermark.init(
  {
    tipo: {
      type: DataTypes.ENUM('imagen', 'texto'),
      defaultValue: 'texto'
    },
    marca: {
      type: DataTypes.STRING(80),
      allowNull: true
    }
  }, 
  {
    sequelize,
    modelName: 'Watermark',
  })

  return Watermark

}