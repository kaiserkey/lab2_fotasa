'use strict'

const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => 
{

  class Usuario extends Model {
    static associate(models) {
      Usuario.hasMany(models.Imagen, { as: 'imagenes', foreignKey: 'usuario_id' })
      Usuario.hasMany(models.Comentario, { as:'comentarios', foreignKey: 'usuario_id' })
      Usuario.hasOne(models.Valoracion, { as: 'valoraciones', foreignKey: 'usuario_id' })
      Usuario.hasMany(models.Publicacion, { as: 'publicaciones', foreignKey: 'usuario_id' })
    }
  }

  Usuario.init({
    nombre: {
      type: DataTypes.STRING(80),
      allowNull: false
    },
    apellido: {
      type: DataTypes.STRING(80),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(80),
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING(101),
      allowNull: false
    },
    intereses: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    ciudad: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    telefono: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    fecha_nacimiento: {
      type: DataTypes.DATE,
      allowNull: true
    },
    avatar: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    nickname: {
      type: DataTypes.STRING(10),
      allowNull: true
    }
  }, 
  {
    sequelize,
    modelName: 'Usuario',
  })

  return Usuario

}