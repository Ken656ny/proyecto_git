#ACCEDER A LAS FUNCIONES DE FLASK
from flask import Flask, jsonify, request

#PARA FACILITAR EL CONSUMO DE LA API GENERADA
from flask_cors import CORS

#PARA DOCUMENTAR LAS RUTAS DEL CODIGO
from flasgger import Swagger

# IMPORTO EL DICCIONARIO CONFIG EN LA POSICION DEVELOPMENT PARA ACCEDER LA INFORMACION DE CONEXION DE LA
# BASE DE DATOS, DENTRO DE ESA CLASE HAY UN CLASSMETHOD QUE RETORNA LA CONEXION CON LA BASE DE DATOS
from config import config
from pymysql.err import IntegrityError
import os
import json
from werkzeug.utils import secure_filename

from datetime import datetime ,date

app = Flask(__name__)
app.secret_key = 'secretkey'
CORS(app, supports_credentials=True)
Swagger(app)

cargar_imagenes = os.path.join(os.path.dirname(__file__), "static", "imagenes_base_de_datos")
os.makedirs(cargar_imagenes, exist_ok=True)
app.config["cargar_imagenes"] = cargar_imagenes

# RUTA PRINCIPAL PARA VISUALIZAR SI EL SERVIDOR ESTA CORRIENDO CON NORMALIDAD

@app.route('/', methods=['GET'])
def ruta_principal():
    return jsonify({'Mensaje':'App funcionnando correctamente'})


# RUTA PARA VALIDACION DE LOGIN
@app.route('/login', methods = ['POST'])
def login():
  """
  Validacion de credenciales para iniciar sesion
  ---
  tags:
    - login
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
    
    with config['development'].conn() as conn:
      with conn.cursor() as cur:
        cur.execute('SELECT correo, contrasena FROM usuario WHERE correo = %s', (correo))
    
    user = cur.fetchone()
    
    if user:
      if user['contrasena'] == constraseña:
        return jsonify({'Mensaje': 'Las crendenciales son correctas'}), 200
      else:
        return jsonify({'Mensaje': 'Contraseña incorrecta'})
    else:
      return jsonify({'Mensaje': 'Usuario no encontrado'}), 404
    
  except Exception as err:
    print(err)
    return jsonify({'Mensaje': 'Error al consultar Usuario'})


# RUTA PARA REGISTRAR USUARIOS NUEVOS
@app.route('/users', methods = ['POST'])
def registro_usuarios():
  """
  Registrar nuevo usuario en la base de datos
  ---
  tags:
    - usuario
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
    num_identi = user['numero_identificacion']
    nom = user['nombre']
    correo = user['correo']
    contra = user['contraseña']
    estado = user['estado']
    id_tipo_iden = user['id_tipo_identificacion']
    
    with config['development'].conn() as conn:
      with conn.cursor() as cur:
        cur.execute('INSERT INTO usuario (nombre,numero_identificacion,correo,contrasena,estado,rol,id_tipo_identificacion) values (%s,%s,%s,%s,%s,%s,%s)',
                  (nom,num_identi,correo,contra,estado,"Aprendiz",id_tipo_iden))
        conn.commit()
    return jsonify({'Mensaje': f'Usuario registrado'})
  except Exception as err:
    print(err)
    return jsonify({'Mensaje':'Error el usuario no pudo ser registrado'})



# ------------------------------
# SECCION DE GESTIONAR PORCINOS
# ------------------------------


# RUTA PARA CONSULTAR TODOS LOS PORCINOS
@app.route('/porcino', methods=['GET'])
def consulta_general_porcinos():
  """
  Consulta general de kos porcinos registrados en la base de datos
  ---
  tags:
    - Porcinos
  responses:
    200:
      descripcion: Lista de los porcinos registrados
  """
  try:
    with config['development'].conn() as conn:
      with conn.cursor() as cur:
          cur.execute("""SELECT id_porcino,peso_inicial,peso_final,fecha_nacimiento,sexo,r.nombre as raza,e.nombre as etapa,estado,p.descripcion
              FROM porcinos p 
              JOIN raza r ON p.id_raza = r.id_raza 
              JOIN etapa_vida e ON p.id_etapa = e.id_etapa""")
          informacion = cur.fetchall()
    
    return jsonify({'Porcinos' : informacion, "Mensaje":'Lista de porcinos'})
    
  except Exception as err:
    print(err)
    return jsonify({'Mensaje':'Error'})


# RUTA PARA CONSULTAR UN PORCINO POR SU ID
@app.route('/porcino/<int:id>', methods=['GET'])
def consulta_individual_porcinos(id):
  """
  Consulta individual por ID de los porcinos registrados en la base de datos
  ---
  tags:
    - Porcinos
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
    with config['development'].conn() as conn:
      with conn.cursor() as cur:
        cur.execute("""
                    SELECT id_porcino,peso_inicial,peso_final,fecha_nacimiento,sexo,r.nombre as raza,e.nombre as etapa,estado,p.descripcion
                    FROM porcinos p 
                    JOIN raza r ON p.id_raza = r.id_raza 
                    JOIN etapa_vida e ON p.id_etapa = e.id_etapa
                    WHERE id_porcino = %s
                    """,(id))
    
    porcino = cur.fetchone()
    
    if porcino:
      return jsonify({'Porcinos': [porcino], 'Mensaje': f'Porcino con id {id} consultado'})
    else:
      print('Porcino no encontrado')
      return jsonify({'Mensaje':'Porcino no encontrado'})
  except Exception as err:
    print(err)
    return jsonify({'Mensaje': 'Error al consultar porcino'})

#Ruta para filtrar los porcinos
@app.route('/porcino/filtros', methods = ['POST'])
def porcinos_filtro():
  """
  Consulta por filtro de los porcinos registrado en la base de datos
  ---
  tags:
    - Porcinos
  parameters:
    - name: body
      in: body
      required: true
      schema:
        type: object
        properties:
          filtro:
            type: string
          valor:
            type: string
  responses:
    200:
      descripcion: Lista de los porcinos filtrada
  """
  try:
    data = request.get_json()
    filtro = data.get('filtro')
    valor = data.get('valor')
    params = []
    
    query = """SELECT id_porcino,peso_inicial,peso_final,fecha_nacimiento,sexo,r.nombre as raza,e.nombre as etapa,estado,p.descripcion
              FROM porcinos p 
              JOIN raza r ON p.id_raza = r.id_raza 
              JOIN etapa_vida e ON p.id_etapa = e.id_etapa
              WHERE 1 = 1
              """
    
    if filtro == 'sexo':
      query += ' AND p.sexo = %s'
      params.append(valor)
    elif filtro == 'raza':
      query += ' AND r.nombre = %s'
      params.append(valor)
    elif filtro == 'etapa':
      query += ' AND e.nombre = %s'
      params.append(valor)
    elif filtro == 'peso_final':
      query += ' AND p.peso_final = %s'
      params.append(valor)
    elif filtro == 'estado':
      query += ' AND p.estado = %s'
      params.append(valor)
    else:
      return jsonify({'Mensaje': 'Seleccione algun filtro...'})

    with config['development'].conn() as conn:
      with conn.cursor() as cur:
          cur.execute(query,params)
          informacion = cur.fetchall()
          if not informacion:
            return jsonify({'Mensaje': 'No hay porcinos registrados con los filtros ingresados'})
          else:
            return jsonify({'Porcinos' : informacion, "Mensaje":'Lista de porcinos'})
  except Exception as err:
    print(err)
    return jsonify({'Mensaje': 'Error'})

#Ruta para consultar el historial de pesos de los porcinos
@app.route('/porcino/historial_pesos', methods = ['GET'])
def consulta_general_historial_pesos():
  """
  Consultar el historial de pesos de los porcinos registrados
  ---
  tags:
    - Porcinos Historial
  responses:
    200:
      description: Lista del historial de pesos de los porcinos registrados
  """
  try:
    with config['development'].conn() as conn:
      with conn.cursor() as cur:
        cur.execute("""
                    SELECT tp.id_documento,tp.fecha_documento,tp.fecha_pesaje,tp.id_porcino,tp.peso_final,u.nombre,tp.descripcion
                    FROM transaccion_peso tp
                    JOIN usuario u
                    ON tp.id_usuario = u.id_usuario
                    ORDER BY fecha_documento DESC
                    """)
        historial = cur.fetchall()
        if historial:
          return jsonify({'Historial': historial, 'Mensaje': 'Listado del historial de los pesos de los porcinos registrados'})
        else:
          return jsonify({'Mensaje': 'No hay historial de pesos registrados'})
  except Exception as err:
    print(err)
    return jsonify({'Mensaje': 'Error'}), 500

#Rura para consultar el historial de pesos de un solo porcino
@app.route('/porcino/historial_pesos/<int:id>', methods = ['GET'])
def consulta_porcino_historial(id):
  """
  Consulta por ID del historial de los pesos de un porcino
  ---
  tags:
    - Porcinos Historial
  responses:
    200:
      description: Listado historial de pesos por ID 
  """
  try:
    with config['development'].conn() as conn:
      with conn.cursor() as cur:
        cur.execute("""
                    SELECT tp.id_documento,tp.fecha_documento,tp.fecha_pesaje,tp.id_porcino,tp.peso_final,u.nombre,tp.descripcion
                    FROM transaccion_peso tp
                    JOIN usuario u
                    ON tp.id_usuario = u.id_usuario
                    WHERE id_porcino = %s
                    ORDER BY fecha_documento DESC
                    """, (id,))
        historial = cur.fetchall()
        if historial:
          return jsonify({'Historial': historial, 'Mensaje': f'Listado del historial de los pesos del porcino con ID {id}'}), 200
        else:
          return jsonify({'Mensaje': f'No hay historial de pesos para el porcino con ID {id}'})
  except Exception as err:
    print(err)
    return jsonify({'Mensaje': 'Error'}), 500


@app.route('/porcino/historial_pesos/conteo_transacciones', methods=['GET'])
def conteo_transacciones():
    """
    Conteo de transacciones de pesos actualizados
    ---
    tags:
      - Porcinos Historial
    responses:
      200:
        description: Número de transacciones registradas en la base de datos
    """
    try:
        with config['development'].conn() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT COUNT(*) FROM transaccion_peso;")
                conteo = cur.fetchone()
                print(conteo)

                if conteo:
                    # Si es dict o tupla, tomar solo el número
                    total = list(conteo.values())[0] if isinstance(conteo, dict) else conteo[0]

                    return jsonify({
                        'Mensaje': 'Conteo de las transacciones hecha en la base de datos',
                        'Conteo': total
                    })
                else:
                    return jsonify({'Mensaje': 'No hay transacciones hechas', 'Conteo': 0})

    except Exception as err:
        print(err)
        return jsonify({'Mensaje': 'Error'}), 500


@app.route('/porcino/historial_pesos/actualizar', methods = ['POST'])
def actualizar_peso_porcinos():
  """
  Registro de transaccion de peso y actualizacion del peso del porcino
  ---
  tags:
    - Porcinos Historial
  parameters: 
  - name: body
    in: body
    required: true
    schema:
      type: object
      properties:
        fecha_documento:
          type: string
          format: date
        fecha_pesaje:
          type: string
          format: date
        id_porcino:
          type: integer
        peso_final:
          type: number
          format: float
        id_usuario:
          type: integer
        descripcion:
          type: string
  responses:
    200:
      description: Registro agregado
  """
  try:
    data = request.get_json()
    fec_pesa = data['fecha_pesaje']
    id_porcino = data['id_porcino']
    peso_final = data['peso_final']
    id_usuario = data['id_usuario']
    descripcion = data['descripcion']
    
    with config['development'].conn() as conn:
      with conn.cursor() as cur :
        cur.execute("CALL sp_actualizar_peso_historial(%s,%s,%s,%s,%s)",(fec_pesa,id_porcino,peso_final,id_usuario,descripcion))
        conn.commit()
        return jsonify({"Mensaje": f'El Peso Final del porcino con id {id_porcino} actualizado'}), 200
  except Exception as err:
    print(err)
    return jsonify({'Mensaje': 'Error'}), 500


# RUTA PARA REGISTRAR A UN PORCINO
@app.route('/porcino', methods=['POST'])
def registrar_porcinos():
  """
  Registrar nuevo porcino en la base de datos
  ---
  tags:
    - Porcinos
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
    id =      porcino['id_porcino']
    p_ini =   float(porcino['peso_inicial'])
    p_fin =   float(porcino['peso_final'])
    fec_nac = datetime.strptime(porcino["fecha_nacimiento"], "%Y-%m-%d").date()
    sexo =    porcino['sexo']
    id_ra =   porcino['id_raza']
    id_eta =  porcino['id_etapa']
    estado =  porcino['estado']
    descripcion = porcino['descripcion']
    # Lista de campos obligatorios
    campos_obligatorios = [
        "id_porcino", "peso_inicial", "peso_final",
        "fecha_nacimiento", "sexo", "id_raza",
        "id_etapa", "estado"
    ]

    # Validar que los campos no estén vacíos
    for campo in campos_obligatorios:
        if campo not in porcino or porcino[campo] in [None, "", " "]:
            return jsonify({"Mensaje": f"El campo '{campo}' es obligatorio"})
    
    # Validar si el peso_inicial y el peso_final no son negativos
    if p_ini < 0 or p_fin < 0:
      return jsonify({"Mensaje": "No se puede registrar un porcino con peso negativo"})
    
    # Validar que la fecha no sea futura
    if fec_nac > date.today():
      return jsonify({"Mensaje": "No se puede registrar un porcino con fecha futura"})
    
    with config['development'].conn() as conn:
      with conn.cursor() as cur:
        cur.execute("""
                    SELECT * FROM porcinos WHERE id_porcino = %s 
                    """,(id))
        porcino = cur.fetchone()
        if porcino:
          return jsonify({"Mensaje": f"Existe un porcino con el id {id}"})
        else:
          cur.execute("""
                      INSERT INTO porcinos (peso_inicial,peso_final,fecha_nacimiento,sexo,id_raza,id_etapa,estado,descripcion,id_porcino) 
                      values (%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
                      (p_ini,p_fin,fec_nac,sexo,id_ra,id_eta,estado,descripcion,id))
          conn.commit()
    
    return jsonify({'Mensaje': f'Porcino con id {id} registrado'})
  
  except Exception as err:
    print(err)
    return jsonify({'Mensaje': f'{err}'})


# RUTA PARA ACTUALIZAR LA INFORMACION DE UN PORCINO POR SU ID
@app.route('/porcino/<int:id>', methods=['PUT'])
def actualizar_porcino(id):
  
  """
  Actualizar registro por ID
  ---
  tags:
    - Porcinos
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
    p_ini =       porcino['peso_inicial']
    p_fin =       porcino['peso_final']
    fec_nac =     porcino['fecha_nacimiento']
    sexo =        porcino['sexo']
    id_ra =       porcino['id_raza']
    id_eta =      porcino['id_etapa']
    estado =      porcino['estado']
    descripcion = porcino['descripcion']
    
    with config['development'].conn() as conn:
      with conn.cursor() as cur:
        cur.execute('UPDATE porcinos SET peso_inicial = %s, peso_final = %s, fecha_nacimiento = %s, sexo = %s, id_raza = %s, id_etapa = %s, estado = %s, descripcion = %s WHERE id_porcino = %s',
                  (p_ini,p_fin,fec_nac,sexo,id_ra,id_eta,estado,descripcion,id))
        conn.commit()
    
    return jsonify({'Mensaje': f'Informacion del porcino con id {id} actualizada'}), 200
  except Exception as err:
    print(err)
    return jsonify({'Mensaje':'Error informacion del porcino no actualizada'}), 500


# RUTA PARA ELIMINAR PORCINO POR ID
@app.route('/porcino/<int:id>', methods=['DELETE'])
def eliminar_porcino(id):
  """
  Eliminar registro por ID de un porcino registrado en la base de datos
  ---
  tags:
    - Porcinos
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
    with config['development'].conn() as conn:
      with conn.cursor() as cur:
        cur.execute('DELETE FROM porcinos WHERE id_porcino = %s', (id))
        conn.commit()
    return jsonify({'Mensaje': f'El porcino con id {id} ha sido eliminado correctamente'})
    
  except Exception as err:
    print(err)
    return jsonify({'Mensaje': f'Error al eliminar el porcino con id {id}'})

# RUTA PARA CONSULTAR TODAS LAS RAZAS
@app.route('/raza', methods = ['GET'])
def consulta_gen_raza():
  """
  Consulta general de las razas registradas en la base de datos
  ---
  tags:
    - Raza
  responses:
    200:
      descripcion: Lista de las razas registradas
  """
  try:
    with config['development'].conn() as conn:
      with conn.cursor() as cur:
        cur.execute('SELECT * FROM raza')
    
    info = cur.fetchall()
    if info:
      return jsonify({'Mensaje': 'Listado de razas', 'razas': info})
    else:
      return jsonify({'Mensaje': 'No hay razas registradas'})
  except Exception as err:
    print(err)
    return jsonify({'Mesaje':'Error en la base de datos'})


# RUTA PARA CONSULTAR UNA RAZA POR SU ID
@app.route('/raza/<int:id>', methods = ['GET'])
def consulta_indi_raza(id):
  """
  Consulta individual por ID de las razas registradas en la base de datos
  ---
  tags:
    - Raza
  parameters:
    - name: codigo
      in: path
      required: true
      type: integer
  responses:
    200:
      description: Raza consultada
  """
  try:
    with config['development'].conn() as conn:
      with conn.cursor() as cur:
        cur.execute('SELECT * FROM raza WHERE id_raza = %s',
                    (id,))
    raza = cur.fetchone()
    if raza:
      return jsonify({'razas': [raza], 'Mensaje': 'Raza consultada'})
    else:
      return jsonify({'Mensaje': f'No hay raza con ID {id}'})
  except Exception as err:
    print(err)
    return jsonify({'Mesaje':'Error en la base de datos'})


# RUTA PARA REGISTRAR RAZAS
@app.route('/raza', methods = ['POST'])
def registrar_raza():
  """
  Registrar nueva etapa en la base de datos
  ---
  tags:
    - Raza
  parameters: 
    - name: body
      in: body
      required: true
      schema:
        type: object
        properties:
          nombre:
            type: string
          descripcion:
            type: string
  responses:
    200:
      description: Raza registada correctamente
  """
  try:
    data = request.get_json()
    nombre = data['nombre']
    desc = data['descripcion']
    with config['development'].conn() as conn:
      with conn.cursor() as cur:
        cur.execute('INSERT INTO raza VALUES (null,%s,%s)',
                (nombre,desc))
        conn.commit()

      return jsonify({'Mensaje': 'Raza registrada correctamente'})
  except Exception as err:
    print(err)
    return jsonify({'Mensaje':'Error en la base de datos'})


# RUTA PARA ACTUALIZAR LA INFORMACION DE UNA RAZA POR SU ID
@app.route('/raza/<int:id>', methods = ['PUT'])
def actualizar_raza(id):
  """
  Actualizar etapa por id
  ---
  tags:
    - Raza
  parameters:
    - name: id_raza
      in: path
      required: true
      type: integer
    - name: body
      in: body
      required: true
      schema:
        type: object
        properties:
          nombre:
            type: string
          descripcion:
            type: string
  responses:
    200:
      description: Raza actualizada correctamente
  """
  try:
    data = request.get_json()
    nombre = data['nombre']
    desc = data['descripcion']
    
    with config['development'].conn() as conn:
      with conn.cursor() as cur:
        cur.execute('UPDATE raza SET nombre = %s, descripcion = %s WHERE id_raza = %s',
                (nombre,desc,id))
        conn.commit()

    return jsonify({'Mensaje': 'Raza actulizada correctamente'})
  except Exception as err:
    print(err)
    return jsonify({'Mesaje':'Error en la base de datos'})


# RUTA PARA ELIMINAR UNA RAZA POR SU ID
@app.route('/raza/<int:id>', methods = ['DELETE'])
def eliminar_raza(id):
  """
  Eliminar registro por ID de una etapa registrado en la base de datos
  ---
  tags:
    - Raza
  parameters:
    - name: id_raza
      in: path
      required: true
      type: integer
  responses:
    200:
      description: Raza eliminada correctamente
    400:
      description: Opcion no existente
    500:
      description: Error en la base de datos
      
  """
  try:
    with config['development'].conn() as conn:
      with conn.cursor() as cur:
        cur.execute('DELETE FROM raza WHERE id_raza = %s',
                (id))
      conn.commit()

    return jsonify({'Mensaje': 'Raza eliminada correctamente'})
  except Exception as err:
    print(err)
    return jsonify({'Mesaje':'Error en la base de datos'})


#RUTA PARA CONSULTAR TODAS LAS ETAPAS DE VIDA
@app.route('/etapa_vida', methods = ['GET'])
def consulta_gen_etapa(): 
  """
  Consulta de etapas de vida
  ---
  tags:
    - Etapa de vida
  responses:
    200:
      description: Lista de etapas de vida registradas
    400:
      description: Opcion no existentes
    500:
      description: Error en la base de datos
  """
  try:
    
    with config['development'].conn() as conn:
      with conn.cursor() as cur:
        cur.execute("""
            SELECT 
                ev.id_etapa, 
                ev.nombre AS nombre_etapa, 
                ev.peso_min, 
                ev.peso_max, 
                ev.duracion_dias,
                ev.duracion_semanas,
                e.nombre as nombre_elemento,
                rn.porcentaje
            FROM etapa_vida ev
            LEFT JOIN requerimientos_nutricionales rn ON ev.id_etapa = rn.id_etapa
            LEFT JOIN elementos e ON rn.id_elemento = e.id_elemento
            ORDER BY ev.id_etapa;
        """)
    
    
    filas = cur.fetchall()
    etapas = {}
    for fila in filas:
      id_etapa = fila['id_etapa']
      if id_etapa not in etapas:
        etapas[id_etapa] = {
          "id_etapa" : id_etapa,
          "nombre_etapa" : fila['nombre_etapa'],
          "peso_min" : fila['peso_min'],
          "peso_max" : fila['peso_max'],
          "duracion_dias" : fila['duracion_dias'],
          "duracion_semanas" : fila['duracion_semanas'],
          "requerimientos" : []
        }
      if fila['nombre_elemento']:
        etapas[id_etapa]['requerimientos'].append({
          "nombre_elemento" : fila["nombre_elemento"],
          "porcentaje" : fila['porcentaje']
        })
      
    if etapas:
      return jsonify({'Mensaje': 'Lista de etapas registradas', 'etapas': etapas}), 200
    else:
      return jsonify({'Mensaje': 'No hay etapas registradas'})
  except Exception as err:
    print(err)
    return jsonify( {'Mensaje': 'Error en la base de datos'} )

# RUTA PARA CONSULTAR UN ETAPA DE VIDA POR SU ID
@app.route('/etapa_vida/<int:id>', methods = ['GET'])
def consulta_indi_etapa(id):
  """
  Consulta individual por ID de los porcinos registrados en la base de datos
  ---
  tags:
    - Etapa de vida
  parameters:
    - name: codigo
      in: path
      required: true
      type: integer
  responses:
    200:
      description: Raza consultada
  """
  try:
    with config['development'].conn() as conn:
      with conn.cursor() as cur:
        cur.execute('SELECT * FROM etapa_vida WHERE id_etapa = %s',
                    (id))
    etapa = cur.fetchone()
    print(etapa)
    if etapa:
      return jsonify({'etapas': [etapa], 'Mensaje': 'Etapa de vida consultada'})
    else:
      return jsonify({'Mensaje': f'No hay etapa con ID {id}'})
  except Exception as err:
    print(err)
    return jsonify( {'Mensaje': 'Error en la base de datos'} )


# RUTA PARA REGISTRAR UNA ETAPA DE VIDA
@app.route('/etapa_vida', methods = ['POST'])
def registrar_etapa():
  """
  Registrar nueva etapa de vida en la base de datos
  ---
  tags:
    - Etapa de vida
  parameters:
    - name: body
      in: body
      required: true
      schema:
        type: object
        properties:
          nombre:
            type: string
          descripcion:
            type: string
        required:
          - nombre
          - descripcion
  responses:
    200:
      description: Etapa de vida registrada correctamente
    400:
      description: Opcion no existentes
    500:
      description: Error en la base de datos
  """
  try:
    
    data = request.get_json()
    nombre_etapa = data['nombre_etapa']
    peso_min = data['peso_min']
    peso_max = data['peso_max']
    duracion_dias = data['duracion_dias']
    duracion_semanas = data['duracion_semanas']
    requerimientos = data['requerimientos']
    descripcion = data['descripcion']
    
    with config['development'].conn() as conn:
      with conn.cursor() as cur:
        cur.execute("""
                    INSERT INTO etapa_vida(nombre,peso_min,peso_max,duracion_dias,duracion_semanas,descripcion)
                    VALUES (%s,%s,%s,%s,%s,%s)
                    """, (nombre_etapa,peso_min,peso_max,duracion_dias,duracion_semanas,descripcion))
        
        id_etapa = cur.lastrowid
        
        if requerimientos:
          for req in requerimientos:
            id_elemento = req['id_elemento']
            porcentaje = req['porcentaje']
            if id_elemento and porcentaje is not None:
              cur.execute("""
                          INSERT INTO requerimientos_nutricionales(id_etapa,id_elemento,porcentaje)
                          VALUES (%s,%s,%s)
                          """, (id_etapa,id_elemento,porcentaje))
        conn.commit()

    return jsonify({'Mensaje': 'Etapa de vida registrada correctamente'}), 201
  except Exception as err:
    print(err)
    return jsonify({'Mesaje':'Error en la base de datos'})


# RUTA PARA ACTUALIZAR LA INFORMACION DE UNA ETAPA DE VIDA POR SU ID
@app.route('/etapa_vida/<int:id>', methods = ['PUT'])
def actualizar_etapa_vida(id):
  """
  Actualizar etapa de vida por id
  ---
  tags:
    - Etapa de vida
  parameters:
    - name: id_etapa
      in: path
      required: true
      type: integer
    - name: body
      in: body
      required: true
      schema:
        type: object
        properties:
          nombre:
            type: string
          descripcion:
            type: string
  responses:
    200:
      description: Etapa de vida actualizada correctamente
  """
  try:
    data = request.get_json()
    nombre_etapa = data['nombre_etapa']
    peso_min = data['peso_min']
    peso_max = data['peso_max']
    duracion_dias = data['duracion_dias']
    duracion_semanas = data['duracion_semanas']
    requerimientos = data['requerimientos']
    descripcion = data['descripcion']
    
    with config['development'].conn() as conn:
      with conn.cursor() as cur:
        cur.execute("""
                    UPDATE etapa_vida
                    SET nombre = %s, peso_min = %s, peso_max = %s, duracion_dias = %s, duracion_semanas = %s, descripcion = %s
                    WHERE id_etapa = %s
                    """, (nombre_etapa,peso_min,peso_max,duracion_dias,duracion_semanas,descripcion,id))
        
        cur.execute("""
                    DELETE FROM requerimientos_nutricionales
                    WHERE id_etapa = %s
                    """, (id,))
        
        if requerimientos:
          for req in requerimientos:
            id_elemento = req['id_elemento']
            porcentaje = req['porcentaje']
            if id_elemento and porcentaje is not None:
              cur.execute("""
                          INSERT INTO requerimientos_nutricionales(id_etapa,id_elemento,porcentaje)
                          VALUES (%s,%s,%s)
                          """, (id,id_elemento,porcentaje))
        conn.commit()

    return jsonify({'Mensaje': 'Etapa de vida actulizada correctamente'})
  except Exception as err:
    print(err)
    return jsonify({'Mesaje':'Error en la base de datos'})


# RUTA PARA ELIMINAR UNA ETAPA DE VIDA POR SU ID
@app.route('/etapa_vida/<int:id>', methods = ['DELETE'])
def eliminar_etapa_vida(id):
  """
  Eliminar registro por ID de una etapa de vida registrado en la base de datos
  ---
  tags:
    - Etapa de vida
  parameters:
    - name: id_etapa
      in: path
      required: true
      type: integer
  responses:
    200:
      description: Etapa de vida eliminada correctamente
    400:
      description: Opcion no existente
    500:
      description: Error en la base de datos
      
  """
  try:
    with config['development'].conn() as conn:
      with conn.cursor() as cur:
        cur.execute('DELETE FROM etapa_vida WHERE id_etapa = %s',
                    (id))
        conn.commit()
    return jsonify({'Mensaje': 'Etapa de vida eliminada correctamente'})
  except Exception as err:
    print(err)
    return jsonify({'Mesaje':'Error en la base de datos'})

#RUTA PARA CONSULTAR LAS NOTIFICAIONES DEL USUARIO
@app.route("/notificaciones/<int:id>", methods = ['GET'])
def consulta_notificaiones(id):
  """
  Consulta de notificaiones de un usuario
  ---
  tags:
    - Notificaiones
  responses:
    200:
      description: Lista de notificaiones de un usuario
  """
  try:
    with config['development'].conn() as conn:
      with conn.cursor() as cursor:
        cursor.execute("""
                      SELECT id_notificacion,titulo, mensaje, tipo,fecha_creacion
                      FROM notificaciones 
                      WHERE id_usuario_destinatario = %s
                      ORDER BY fecha_creacion DESC
                      """, (id))
    info = cursor.fetchall()
    if info:
      return jsonify({'Mensaje' : 'Lista de notificaciones', 'Notificaciones' : info})
    else:
      return jsonify({'Mensaje': 'No hay notificaciones'})
  except Exception as err:
    print(err)
    return jsonify({'Mensaje': 'Error'})


# ----------------------------
# SECCION GESTIONAR ALIMENTOS
# ----------------------------

# RUTA PARA CONSULTAR TODOS LOS ALIMENTOS
@app.route("/alimentos", methods=["GET"])
def consulta_alimento():
    """
    Consultar de Alimentos
    ---
    tags:
      - Gestion de Alimentos
    responses:
      200:
        description: Lista de alimentos
    """
    try:
        with config['development'].conn() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT 
                        a.id_alimento,
                        a.nombre AS nombre_alimento,
                        a.imagen AS imagen_alimento,  
                        e.nombre AS nombre_elemento,
                        a.estado AS estado_alimento,
                        ate.valor
                    FROM alimentos a
                    JOIN alimento_tiene_elemento ate ON a.id_alimento = ate.id_alimento
                    JOIN elementos e ON e.id_elemento = ate.id_elemento
                """)
                filas = cur.fetchall()

        if not filas:
            return jsonify({"mensaje": "No encontrado"})

        agrupado = {}
        for fila in filas:
            id_alimento = fila["id_alimento"]
            if id_alimento not in agrupado:
                agrupado[id_alimento] = {
                    "id_alimento": id_alimento,
                    "nombre": fila["nombre_alimento"],
                    "imagen": fila["imagen_alimento"],  
                    "estado": fila["estado_alimento"], 
                    "elementos": []
                }
            agrupado[id_alimento]["elementos"].append({
                "nombre": fila["nombre_elemento"],
                "valor": float(fila["valor"])
            })

        resultado = list(agrupado.values())
        return jsonify({"mensaje": resultado})

    except Exception as e:
        return jsonify({"error": str(e)})


# RUTA PARA CONSULTAR UN ALIMENTO POR SU ID
@app.route("/consulta_indi_alimento/<nombre>", methods=["GET"])
def consulta_individual_alimento(nombre):
  try:
      with config['development'].conn() as conn:
          with conn.cursor() as cur:
              cur.execute("""
                  SELECT 
                      a.id_alimento, 
                      a.nombre AS nombre_alimento, 
                      e.nombre AS nombre_elemento, 
                      ate.valor 
                  FROM alimentos a
                  JOIN alimento_tiene_elemento ate ON a.id_alimento = ate.id_alimento
                  JOIN elementos e ON e.id_elemento = ate.id_elemento
                  WHERE a.nombre = %s
              """, (nombre,))
              
              filas = cur.fetchall()
              
              if not filas:
                  return jsonify({"mensaje": None})
              
              alimento = {
                  "id_alimento": filas[0]["id_alimento"],
                  "nombre": filas[0]["nombre_alimento"],
                  "elementos": []
              }
              
              for fila in filas:
                  alimento["elementos"].append({
                      "nombre": fila["nombre_elemento"],
                      "valor": float(fila["valor"])
                  })
              
              return jsonify({"mensaje": alimento})
  except Exception as e:
      return jsonify({"error": str(e)})

@app.route("/alimentos_disponible", methods=["GET"])
def consulta_alimento_disponible():
    """
    Consultar Alimentos disponibles
    ---
    tags:
      - Gestion de Alimentos
    responses:
      200:
        description: Lista de alimentos disponibles
    """
    try:
        with config['development'].conn() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT 
                        a.id_alimento,
                        a.nombre AS nombre_alimento,
                        a.imagen AS imagen_alimento,  
                        e.nombre AS nombre_elemento,
                        a.estado AS estado_alimento,
                        ate.valor
                    FROM alimentos a
                    JOIN alimento_tiene_elemento ate ON a.id_alimento = ate.id_alimento
                    JOIN elementos e ON e.id_elemento = ate.id_elemento
                    WHERE a.estado = 'activo'  
                """)
                filas = cur.fetchall()

        if not filas:
            return jsonify({"mensaje": "No se encontraron alimentos disponibles"})

        agrupado = {}
        for fila in filas:
            id_alimento = fila["id_alimento"]
            if id_alimento not in agrupado:
                agrupado[id_alimento] = {
                    "id_alimento": id_alimento,
                    "nombre": fila["nombre_alimento"],
                    "imagen": fila["imagen_alimento"],  
                    "estado": fila["estado_alimento"], 
                    "elementos": []
                }
            agrupado[id_alimento]["elementos"].append({
                "nombre": fila["nombre_elemento"],
                "valor": float(fila["valor"])
            })

        resultado = list(agrupado.values())
        return jsonify({"mensaje": resultado})

    except Exception as e:
        return jsonify({"error": str(e)})

@app.route("/registrar_alimento/", methods=["POST"])
def registrar_alimento():
    try:
        nombre = request.form.get("nombre_alimento")
        elementos = request.form.get("elementos")
        imagen_file = request.files.get("imagen")
        if not nombre:
            return jsonify({"error": "El nombre del alimento es obligatorio"}), 400
        if imagen_file and imagen_file.filename != "":
            filename = secure_filename(imagen_file.filename)
            ruta = os.path.join(app.config["cargar_imagenes"], filename)
            imagen_file.save(ruta)
            imagen_web = f"/static/imagenes_base_de_datos/{filename}"

        else:
            imagen_web = None
        with config['development'].conn() as conn:
            with conn.cursor() as cur:
                id_usuario = 1066872759
                cur.execute(
                    """
                    INSERT INTO alimentos (nombre, estado, imagen, id_usuario)
                    VALUES (%s, %s, %s, %s)
                    """,
                    (nombre, "activo", imagen_web, id_usuario)
                )
                id_alimento = cur.lastrowid
                if elementos:
                    elementos = json.loads(elementos)
                    for elem in elementos:
                        cur.execute(
                            """
                            INSERT INTO alimento_tiene_elemento (id_alimento, id_elemento, valor)
                            VALUES (%s, %s, %s)
                            """,
                            (id_alimento, elem["id"], elem["valor"])
                        )
                conn.commit()

        return jsonify({
            "mensaje": "Alimento creado correctamente",
            "id_alimento": id_alimento,
            "imagen": imagen_web
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/consulta_indi_alimento_disponible/<nombre>", methods=["GET"])
def consulta_individual_alimento_disponible(nombre):
    """
    Consultar un alimento individual (si está activo o disponible)
    """
    try:
        with config['development'].conn() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT 
                        a.id_alimento, 
                        a.nombre AS nombre_alimento, 
                        a.imagen AS imagen_alimento,
                        e.nombre AS nombre_elemento,
                        a.estado,
                        ate.valor 
                    FROM alimentos a
                    JOIN alimento_tiene_elemento ate ON a.id_alimento = ate.id_alimento
                    JOIN elementos e ON e.id_elemento = ate.id_elemento
                    WHERE a.nombre = %s AND a.estado IN ('Activo', 'disponible')
                """, (nombre,))
                
                filas = cur.fetchall()
                
                # Si no hay resultados
                if not filas:
                    return jsonify({"mensaje": None})
                
                # Estructurar respuesta
                alimento = {
                    "id_alimento": filas[0]["id_alimento"],
                    "nombre": filas[0]["nombre_alimento"],
                    "imagen": filas[0]["imagen_alimento"],
                    "estado": filas[0]["estado"],  
                    "elementos": []
                }
                
                for fila in filas:
                    alimento["elementos"].append({
                        "nombre": fila["nombre_elemento"],
                        "valor": float(fila["valor"])
                    })
                
                return jsonify({"mensaje": alimento})
                
    except Exception as e:
        return jsonify({"error": str(e)})

@app.route("/consulta_indi_alimento/<nombre>", methods=["GET"])
def consulta_individual_alimento(nombre):
    try:
        with config['development'].conn() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT 
                        a.id_alimento, 
                        a.nombre AS nombre_alimento, 
                        e.nombre AS nombre_elemento,
                        a.estado,
                        ate.valor 
                    FROM alimentos a
                    JOIN alimento_tiene_elemento ate ON a.id_alimento = ate.id_alimento
                    JOIN elementos e ON e.id_elemento = ate.id_elemento
                    WHERE a.nombre = %s
                """, (nombre,))
                
                filas = cur.fetchall()
                
                if not filas:
                    return jsonify({"mensaje": None})
                
                alimento = {
                    "id_alimento": filas[0]["id_alimento"],
                    "nombre": filas[0]["nombre_alimento"],
                    "estado": filas[0]["estado"],  
                    "elementos": []
                }
                
                for fila in filas:
                    alimento["elementos"].append({
                        "nombre": fila["nombre_elemento"],
                        "valor": float(fila["valor"])
                    })
                
                return jsonify({"mensaje": alimento})
    except Exception as e:
        return jsonify({"error": str(e)})
      
      
@app.route("/actualizar_alimento/<int:id_alimento>", methods=["PUT", "POST"])
def actualizar_alimento(id_alimento):
    try:
        if request.content_type.startswith("multipart/form-data"):
            nombre = request.form.get("nombre")
            estado = request.form.get("estado", "activo")
            elementos = json.loads(request.form.get("elementos", "[]"))
            imagen_file = request.files.get("imagen")
        else:
            data = request.get_json()
            nombre = data.get("nombre")
            estado = data.get("estado", "activo")
            elementos = data.get("elementos", [])
            imagen_file = None

        if not nombre:
            return jsonify({"error": "El nombre del alimento es obligatorio."}), 400

        imagen_web = None
        if imagen_file and imagen_file.filename != "":
            filename = secure_filename(imagen_file.filename)
            ruta = os.path.join(app.config["cargar_imagenes"], filename)
            imagen_file.save(ruta)
            imagen_web = f"/static/imagenes_base_de_datos/{filename}"


        with config['development'].conn() as conn:
            with conn.cursor() as cur:

                if imagen_web:
                    cur.execute("""
                        UPDATE alimentos 
                        SET nombre = %s, estado = %s, imagen = %s 
                        WHERE id_alimento = %s
                    """, (nombre, estado, imagen_web, id_alimento))
                else:
                    cur.execute("""
                        UPDATE alimentos 
                        SET nombre = %s, estado = %s
                        WHERE id_alimento = %s
                    """, (nombre, estado, id_alimento))

                for elem in elementos:
                    cur.execute("""
                        INSERT INTO alimento_tiene_elemento (id_alimento, id_elemento, valor)
                        VALUES (%s, %s, %s)
                        ON DUPLICATE KEY UPDATE valor = VALUES(valor)
                    """, (id_alimento, elem["id_elemento"], elem["valor"]))

                conn.commit()

        return jsonify({
            "mensaje": "Alimento actualizado correctamente",
            "imagen": imagen_web  
        }), 200

    except IntegrityError as e:
        if e.args[0] == 1062:
            return jsonify({"error": f"Ya existe un alimento con el nombre '{nombre}'."}), 400
        return jsonify({"error": "Error de integridad en la base de datos."}), 400

    except Exception as e:
        print("Error en actualización:", e)
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)
