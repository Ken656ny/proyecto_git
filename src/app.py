#ACCEDER A LAS FUNCIONES DE FLASK
from flask import Flask, jsonify, request

#PARA FACILITAR EL CONSUMO DE LA API GENERADA
from flask_cors import CORS

#PARA DOCUMENTAR LAS RUTAS DEL CODIGO
from flasgger import Swagger

# IMPORTO EL DICCIONARIO CONFIG EN LA POSICION DEVELOPMENT PARA ACCEDER LA INFORMACION DE CONEXION DE LA
# BASE DE DATOS, DENTRO DE ESA CLASE HAY UN CLASSMETHOD QUE RETORNA LA CONEXION CON LA BASE DE DATOS
from config import config

app = Flask(__name__)
app.secret_key = 'secretkey'
CORS(app)
Swagger(app)


@app.route('/', methods=['GET'])
def ruta_principal():
    return jsonify({'Mensaje':'App funcionnando correctamente'})


@app.route('/login', methods = ['POST'])
def login():
  """
  Validacion de credenciales para iniciar sesion
  ---
  parameters: 
    - name: body
      in: body
      required: true
      schema:
        type: object
        properties:
          correo:
            type: string
          contraseña:
            type: string
  responses:
    200:
      description: Las credenciales coiciden 
  """
  try:
    data = request.get_json()
    correo = data['correo']
    constraseña = data['contraseña']
    
    conex = config['development'].conn()
    cursor = conex.cursor()
    cursor.execute('SELECT correo, contrasena FROM usuario WHERE correo = %s', (correo))
    user = cursor.fetchone()
    cursor.close()
    conex.close()
    
    if user:
      if user[1] == constraseña:
        return jsonify({'Mensaje': 'Las crendenciales son correctas'})
      else:
        return jsonify({'Mensaje': 'Contraseña incorrecta'})
    else:
      return jsonify({'Mensaje': 'Usuario no encontrado'})
    
  except Exception as err:
    print(err)
    return jsonify({'Mensaje': 'Error al consultar Usuario'})



@app.route('/users', methods = ['POST'])
def registro_usuarios():
  """
  Registrar nuevo usuario en la base de datos
  ---
  parameters: 
    - name: body
      in: body
      required: true
      schema:
        type: object
        properties:
          id_usuario:
            type: integer
          nombre:
            type: string
          apelldio:
            type: string
          correo:
            type: string
          contraseña:
            type: string
          estado:
            type: enum('Activo','Inactivo')
          id_tipo_identificacion:
            type: integer
  responses:
    200:
      description: Usuario agregado
  """
  try:
    user = request.get_json()
    id_usuario = user['id_usuario']
    nom = user['nombre']
    correo = user['correo']
    contra = user['contraseña']
    estado = user['estado']
    id_tipo_iden = user['id_tipo_identificacion']
    
    conex = config['development'].conn()
    cursor = conex.cursor()
    cursor.execute('INSERT INTO usuario (id_usuario,nombre,correo,contrasena,estado,id_tipo_identificacion) values (%s,%s,%s,%s,%s,%s)',
                  (id_usuario,nom,correo,contra,estado,id_tipo_iden))
    conex.commit()
    cursor.close()
    conex.close()
    return jsonify({'Mensaje': f'Usuario registrado'})
  
  except Exception as err:
    print(err)
    return jsonify({'Mensaje':'Error el usuario no pudo ser registrado'})


@app.route('/porcinos', methods=['GET'])
def consulta_general_porcinos():
  """
  Consulta general de kos porcinos registrados en la base de datos
  ---
  responses:
    200:
      descripcion: Lista de los porcinos registrados
  """
  try:
    conex = config['development'].conn()
    cursor = conex.cursor()
    cursor.execute('SELECT * FROM porcinos')
    informacion = cursor.fetchall()
    porcinos = []
    
    for porcino in informacion:
      dato = {
        'id_porcino' : porcino[0],
        'peso_inicial' : porcino[1],
        'peso_final' : porcino[2],
        'fecha_nacimiento' : porcino[3],
        'sexo' : porcino[4],
        'id_raza' : porcino[5],
        'id_etapa' : porcino[6],
        'estado' : porcino[7],
        'descripcion' : porcino[8]
      }
      porcinos.append(dato)
    cursor.close()
    conex.close()
    
    return jsonify({'Porcinos': porcinos, 'Mensaje':'Listado de porcinos'})
    
  except Exception as err:
    print(err)
    return jsonify({'Mensaje':'Error'})


@app.route('/porcino/<int:id>', methods=['GET'])
def consulta_individual_porcinos(id):
  """
  Consulta individual por ID de los porcinos registrados en la base de datos
  ---
  parameters:
    - name: codigo
      in: path
      required: true
      type: integer
  responses:
    200:
      description: Registro encontrado
  """
  try:
    conex = config['development'].conn()
    cursor = conex.cursor()
    cursor.execute('SELECT * FROM porcinos WHERE id_porcino = %s', (id,))
    porcino = cursor.fetchone()
    
    dato = {
      'id_porcino' : porcino[0],
      'peso_inicial' : porcino[1],
      'peso_final' : porcino[2],
      'fecha_nacimiento' : porcino[3],
      'sexo' : porcino[4],
      'id_raza' : porcino[5],
      'id_etapa' : porcino[6],
      'estado' : porcino[7],
      'descripcion' : porcino[8]
      }
    
    cursor.close()
    conex.close()
    
    return jsonify({'Porcinos': dato, 'Mensaje': f'Porcino con {id} consultado'})
  except Exception as err:
    print(err)
    return jsonify({'Mensaje': 'Error al consultar porcino'})

# REGISTRAR A UN PORCINO

@app.route('/porcino', methods=['POST'])

def registrar_porcinos():
  """
  Registrar nuevo porcino en la base de datos
  ---
  parameters: 
    - name: body
      in: body
      required: true
      schema:
        type: object
        properties:
          peso_inicial:
            type: float
          peso_final:
            type: float
          fecha_nacimiento:
            type: Date
          sexo:
            type: bool
          id_raza:
            type: integer
          id_etapa:
            type: integer
          estado:
            type: enum('Activo','Inactivo')
          descripcion:
            type: string
  responses:
    200:
      description: Registro agregado
  """
  try:
    porcino = request.get_json()
    id = porcino['id_porcino']
    p_ini = porcino['peso_inicial']
    p_fin = porcino['peso_final']
    fec_nac = porcino['fecha_nacimiento']
    sexo = porcino['sexo']
    id_ra = porcino['id_raza']
    id_eta = porcino['id_etapa']
    estado = porcino['estado']
    descripcion = porcino['descripcion']
    
    conex = config['development'].conn()
    cursor = conex.cursor()
    cursor.execute('INSERT INTO porcinos (peso_inicial,peso_final,fecha_nacimiento,sexo,id_raza,id_etapa,estado,descripcion,id_porcino) values (%s,%s,%s,%s,%s,%s,%s,%s,%s)',
                  (p_ini,p_fin,fec_nac,sexo,id_ra,id_eta,estado,descripcion,id))
    conex.commit()
    cursor.close()
    conex.close()
    return jsonify({'Mensaje': f'Porcino con id {id} registrado'})
  
  except Exception as err:
    print(err)
    return jsonify({'Mensaje':'Error el porcino no pudo ser registrado'})

# ACTUALIZAR LA INFORMACION DE UN PORCINO

@app.route('/porcino/<int:id>', methods=['PUT'])
def actualizar_porcino(id):
  
  """
  Actualizar registro por ID
  ---
  parameters:
    - name: id_porcino
      in: path
      required: true
      type: integer
    - name: body
      in: body
      required: true
      schema:
        type: object
        properties:
          peso_inicial:
            type: float
          peso_final:
            type: float
          fecha_nacimiento:
            type: Date
          sexo:
            type: bool
          id_raza:
            type: integer
          id_etapa:
            type: integer
          estado:
            type: enum('Activo','Inactivo')
          descripcion:
            type: string
  responses:
    200:
      description: Registro actualizado
  """
  try:
    porcino = request.get_json()
    p_ini = porcino['peso_inicial']
    p_fin = porcino['peso_final']
    fec_nac = porcino['fecha_nacimiento']
    sexo = porcino['sexo']
    id_ra = porcino['id_raza']
    id_eta = porcino['id_etapa']
    estado = porcino['estado']
    descripcion = porcino['descripcion']
    
    conex = config['development'].conn()
    cursor = conex.cursor()
    cursor.execute('UPDATE porcinos SET peso_inicial = %s, peso_final = %s, fecha_nacimiento = %s, sexo = %s, id_raza = %s, id_etapa = %s, estado = %s, descripcion = %s WHERE id_porcino = %s',
                  (p_ini,p_fin,fec_nac,sexo,id_ra,id_eta,estado,descripcion,id))
    conex.commit()
    cursor.close()
    conex.close()
    return jsonify({'Mensaje': f'Informacion del porcino con id {id} actualizada'})
  except Exception as err:
    print(err)
    return jsonify({'Mensaje':'Error informacion del porcino no actualizada'})

# RUTA PARA ELIMINAR PORCINO POR ID

@app.route('/porcino/<int:id>', methods=['DELETE'])
def eliminar_porcino(id):
  """
  Eliminar registro por ID de un porcino registrado en la base de datos
  ---
  parameters:
    - name: codigo
      in: path
      required: true
      type: integer
  responses:
    200:
      description: Registro del porcino eliminado
  """
  try:
    id = int(id)
    conex = config['development'].conn()
    cursor = conex.cursor()
    cursor.execute('DELETE FROM porcinos WHERE id_porcino = %s', (id))
    conex.commit()
    cursor.close()
    conex.close()
    
    return jsonify({'Mensaje': f'El porcino con id {id} ha sido eliminado correctamente'})
    
  except Exception as err:
    print(err)
    return jsonify({'Mensaje': f'Error al eliminar el porcino con id {id}'})


if __name__ == '__main__':
    app.run(debug=True)