'use strict'

const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => 
{

  class Imagen extends Model {
    
    static associate(models) {
      Imagen.belongsTo(models.Usuario)
      Imagen.hasOne(models.Publicacion, { as: 'imagen_publicaciones', foreignKey: 'imagen_id' })
    }

  }

  Imagen.init({
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    estado: {
      type: DataTypes.ENUM('publico', 'protegido'),
      defaultValue: 'protegido'
    },
    formato: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    size: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    resolucion: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    derechos: {
      type: DataTypes.ENUM('copyright', 'copyleft'),
      defaultValue: 'copyright'
    }
  }, 
  {
    sequelize,
    modelName: 'Imagen',
  }
  )

  return Imagen

}