#ACCEDER A LAS FUNCIONES DE FLASK
from flask import Flask, jsonify, request
from flask import Flask, render_template, request, jsonify
import pymysql
from config import DevelopmentConfig
from config import config

#PARA FACILITAR EL CONSUMO DE LA API GENERADA
from flask_cors import CORS


#PARA DOCUMENTAR LAS RUTAS DEL CODIGO
from flasgger import Swagger


# IMPORTO EL DICCIONARIO CONFIG EN LA POSICION DEVELOPMENT PARA ACCEDER LA INFORMACION DE CONEXION DE LA
# BASE DE DATOS, DENTRO DE ESA CLASE HAY UN CLASSMETHOD QUE RETORNA LA CONEXION CON LA BASE DE DATOS
from config import config

from datetime import datetime
from io import BytesIO

from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.lib import colors


app = Flask(__name__)
app.secret_key = 'secretkey'
CORS(app)
Swagger(app)

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
        return jsonify({'Mensaje': 'Las crendenciales son correctas'})
      else:
        return jsonify({'Mensaje': 'Contraseña incorrecta'})
    else:
      return jsonify({'Mensaje': 'Usuario no encontrado'})
    
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
        cur.execute('INSERT INTO usuario (nombre,correo,contrasena,estado,id_tipo_identificacion,id_usuario) values (%s,%s,%s,%s,%s,%s)',
                  (nom,correo,contra,estado,id_tipo_iden,num_identi))
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
        cur.execute('SELECT id_porcino,peso_inicial,peso_final,fecha_nacimiento,sexo,r.nombre as raza,e.nombre as etapa,estado,p.descripcion FROM porcinos p JOIN raza r ON p.id_raza = r.id_raza JOIN etapa_vida e ON p.id_etapa = e.id_etapa')
    informacion = cur.fetchall()
    return jsonify(informacion)
    
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
        cur.execute('SELECT * FROM porcinos WHERE id_porcino = %s', (id,))
    
    porcino = cur.fetchone()
    print(porcino)
    if porcino:
      return jsonify({'Porcinos': porcino, 'Mensaje': f'Porcino con id {id} consultado'})
    else:
      print('Porcino no encontrado')
      return jsonify({'Mensaje':'Porcino no encontrado'})
  except Exception as err:
    print(err)
    return jsonify({'Mensaje': 'Error al consultar porcino'})

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

        # No tomamos id_porcino porque la BD lo genera automáticamente
        p_ini = porcino['peso_inicial']
        p_fin = porcino['peso_final']
        fec_nac = porcino['fecha_nacimiento']
        sexo = porcino['sexo']
        id_ra = porcino['id_raza']
        id_eta = porcino['id_etapa']
        estado = porcino['estado']
        descripcion = porcino['descripcion']

        with config['development'].conn() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO porcinos 
                    (peso_inicial, peso_final, fecha_nacimiento, sexo, id_raza, id_etapa, estado, descripcion)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """, (p_ini, p_fin, fec_nac, sexo, id_ra, id_eta, estado, descripcion))
                conn.commit()

        return jsonify({'Mensaje': 'Porcino registrado correctamente'})

    except Exception as err:
        print("❌ Error al registrar porcino:", err)
        return jsonify({'Mensaje': 'Error el porcino no pudo ser registrado'})



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
        cur.execute('DELETE FROM porcinos WHERE id_porcino = %s', (id,))
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
        cur.execute('SELECT * FROM etapa WHERE id_raza = %s',
                    (id,))
    etapa = cur.fetchone()
    print(etapa)
    if etapa:
      return jsonify({'Raza': etapa, 'Mensaje': 'Raza consultada'})
    else:
      return jsonify({'Mensaje': 'Error al consultar la etapa'})
      
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
        cur.execute('SELECT * FROM etapa_vida')
    
    info = cur.fetchall()
    if info:
      return jsonify({'Mensaje': 'Lista de etapas registradas', 'etapas': info})
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
      return jsonify({'Etapa_vida': etapa, 'Mensaje': 'Etapa de vida consultada'})
    else:
      return jsonify({'Mensaje': 'Error al consultar la etapa'})
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
    nombre = data['nombre']
    desc = data['descripcion']
    
    with config['development'].conn() as conn:
      with conn.cursor() as cur:
        cur.execute('INSERT INTO etapa_vida VALUES (null,%s,%s)',
                    (nombre,desc))
        conn.commit()

    return jsonify({'Mensaje': 'Etapa de vida registrada correctamente'})
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
    nombre = data['nombre']
    desc = data['descripcion']
    
    with config['development'].conn() as conn:
      with conn.cursor() as cur:
        cur.execute('UPDATE etapa_vida SET nombre = %s, descripcion = %s WHERE id_etapa = %s',
                    (nombre,desc,id))
        conn.commit()

    return jsonify({'Mensaje': 'Raza actulizada correctamente'})
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


# RUTA PARA REGISTRAR UN ALIMENTO
@app.route("/registrar_alimento/", methods=["POST"])
def registrar_alimento():
  """
  Consultar de Alimentos
  ---
  tags:
    - Gestion de Alimentos
  responses:
    200:
      description: Lista de alimentos
  """
  data = request.get_json()
  if not data:
      return jsonify({"error": "No se recibió ningún dato"}), 400

  nombre = data.get("nombre_alimento")
  elementos = data.get("elementos", [])

  if not nombre:
      return jsonify({"error": "El nombre del alimento es obligatorio"}), 400

  try:
      with config['development'].conn() as conn:
          with conn.cursor() as cur:
              
              id_usuario = 2

              cur.execute(
                  "INSERT INTO alimentos (nombre, estado, descripcion, id_usuario) VALUES (%s, %s, %s, %s)",
                  (nombre, "activo", "", id_usuario)
              )
              id_alimento = cur.lastrowid

              for elem in elementos:
                  cur.execute(
                      """
                      INSERT INTO alimento_tiene_elemento 
                      (id_alimento, id_elemento, valor) 
                      VALUES (%s, %s, %s)
                      """,
                      (id_alimento, elem["id"], elem["valor"])
                  )
              conn.commit()
      return jsonify({"mensaje": "Alimento creado correctamente", "id_alimento": id_alimento})
  except Exception as e:
      return jsonify({"error": str(e)}), 500
# -------------------------------
# RUTA PARA ELIMINAR UN ALIMENTO
# -------------------------------
@app.route("/eliminar_alimento/<int:id>", methods=["DELETE"])
def eliminar_alimento(id):
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
                cur.execute("DELETE FROM alimento_tiene_elemento WHERE id_alimento = %s", (id,))
                cur.execute("DELETE FROM alimentos WHERE id_alimento = %s", (id,))
                conn.commit()

        return jsonify({"mensaje": f"Alimento con id {id} eliminado correctamente"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500
      
      
      
      
      
# ----------------------------------------------------
# AREA DE REPORTE_PORCINOS
# ----------------------------------------------------
@app.route('/reportes/pesos', methods=['GET'])
def reportes_pesos():

    etapa = request.args.get("etapa")   # id de etapa (1,2,3...)
    tipo = request.args.get("tipo")     # alto / bajo / todos

    if not etapa or not tipo:
        return jsonify({"error": "Faltan parámetros"}), 400

    try:
        # Consulta base (sin filtro de alto/bajo todavía)
        sql = """
            SELECT 
                p.id_porcino,
                p.peso_final,
                r.nombre AS raza,
                ev.nombre AS etapa,
                ev.peso_min,
                ev.peso_max
            FROM porcinos p
            JOIN raza r ON p.id_raza = r.id_raza
            JOIN etapa_vida ev ON p.id_etapa = ev.id_etapa
            WHERE p.estado = 'Activo'
              AND p.id_etapa = %s
        """

        # ------------------------
        # LÓGICA CORRECTA PARA FILTROS
        # ------------------------

        # PESO BAJO:
        # todo lo que esté por debajo del mínimo o dentro del rango (peso_final <= peso_max)
        if tipo == "bajo":
            sql += " AND p.peso_final <= ev.peso_max"

        # PESO ALTO:
        # solo los que superan el rango de la etapa (peso_final > peso_max)
        elif tipo == "alto":
            sql += " AND p.peso_final > ev.peso_max"

        # TODOS: no se agrega nada
        elif tipo == "todos":
            pass

        else:
            return jsonify({"error": "Tipo inválido"}), 400

        # Ordenar para que se vea bonito
        sql += " ORDER BY p.peso_final ASC"

        # Ejecutar consulta
        with config['development'].conn() as conn:
            with conn.cursor(pymysql.cursors.DictCursor) as cur:
                cur.execute(sql, (etapa,))
                data = cur.fetchall()

        return jsonify(data)

    except Exception as e:
        print("❌ Error en /reportes/pesos:", e)
        return jsonify({"error": "Error interno"}), 500









# ----------------------------------------------------
# AREA GESTIONAR USUARIO
# ----------------------------------------------------
@app.route('/usuarios', methods=['GET'])
def listar_usuarios():

    tipo = request.args.get("tipo")  # interno / externo / todos

    if not tipo:
        return jsonify({"error": "Falta parámetro tipo"}), 400

    try:
        sql_interno = """
            SELECT 
                id_usuario AS id,
                nombre,
                correo,
                estado,
                rol,
                'Interno' AS tipo
            FROM usuario
        """

        sql_externo = """
            SELECT 
                id_usuario_externo AS id,
                nombre,
                correo,
                'Activo' AS estado,
                rol,
                'Google' AS tipo
            FROM usuario_externo
        """

        result = []

        with config['development'].conn() as conn:
            with conn.cursor(pymysql.cursors.DictCursor) as cur:

                # ---- interno ----
                if tipo in ["interno", "todos"]:
                    cur.execute(sql_interno)
                    result += cur.fetchall()

                # ---- externo ----
                if tipo in ["externo", "todos"]:
                    cur.execute(sql_externo)
                    result += cur.fetchall()

        return jsonify(result)

    except Exception as e:
        print("❌ Error en /usuarios:", e)
        return jsonify({"error": "Error interno"}), 500









# ----------------------------------------------------
# API: EDITAR USUARIO (interno o externo)
# ----------------------------------------------------
@app.route("/usuarios", methods=["PUT"])
def editar_usuario():

    data = request.json
    if not data or "id" not in data or "tipo" not in data:
        return jsonify({"error": "Datos incompletos"}), 400

    try:
        with config['development'].conn() as conn:
            with conn.cursor() as cur:

                if data["tipo"] == "Interno":
                    sql = """
                        UPDATE usuario
                        SET nombre=%s, correo=%s, estado=%s
                        WHERE id_usuario=%s
                    """
                    cur.execute(sql, (
                        data["nombre"],
                        data["correo"],
                        data["estado"],
                        data["id"]
                    ))

                elif data["tipo"] == "Google":
                    sql = """
                        UPDATE usuario_externo
                        SET nombre=%s, correo=%s, rol=%s
                        WHERE id_usuario_externo=%s
                    """
                    cur.execute(sql, (
                        data["nombre"],
                        data["correo"],
                        data["rol"],
                        data["id"]
                    ))
                else:
                    return jsonify({"error": "Tipo inválido"}), 400

                conn.commit()

        return jsonify({"message": "Usuario actualizado correctamente"})

    except Exception as e:
        print("❌ Error:", e)
        return jsonify({"error": "Error interno"}), 500



# ----------------------------------------------------
# API: ELIMINAR USUARIO
# ----------------------------------------------------
@app.route("/usuarios", methods=["DELETE"])
def eliminar_usuario():

    id = request.args.get("id")
    tipo = request.args.get("tipo")

    if not id or not tipo:
        return jsonify({"error": "Faltan parámetros"}), 400

    try:
        with config['development'].conn() as conn:
            with conn.cursor() as cur:

                if tipo == "Interno":
                    cur.execute("DELETE FROM usuario WHERE id_usuario=%s", (id,))
                elif tipo == "Google":
                    cur.execute("DELETE FROM usuario_externo WHERE id_usuario_externo=%s", (id,))
                else:
                    return jsonify({"error": "Tipo inválido"}), 400

                conn.commit()

        return jsonify({"message": "Usuario eliminado correctamente"})

    except Exception as e:
        print("❌ Error:", e)
        return jsonify({"error": "Error interno"}), 500






#AREA DE REPORTES_ALIMENTOS

@app.route('/reportes/alimentos', methods=['GET'])
def reportes_alimentos():
    try:
        # Obtener todas las dietas activas
        sql_dietas = """
            SELECT id_dieta 
            FROM dietas 
            WHERE estado = 'Activo'
        """

        # Obtener los alimentos con cantidades
        sql_alimentos = """
            SELECT 
                a.id_alimento,
                a.nombre AS alimento,
                d.id_dieta,
                d.descripcion AS dieta,
                dta.cantidad
            FROM alimentos a
            LEFT JOIN dieta_tiene_alimentos dta ON a.id_alimento = dta.id_alimento
            LEFT JOIN dietas d ON dta.id_dieta = d.id_dieta
            WHERE a.estado = 'Activo'
            ORDER BY a.id_alimento
        """

        with config['development'].conn() as conn:
            with conn.cursor(pymysql.cursors.DictCursor) as cur:
                
                # Cargar dietas activas
                cur.execute(sql_dietas)
                dietas_activas = [row["id_dieta"] for row in cur.fetchall()]
                total_dietas = len(dietas_activas)

                # Cargar datos alimentos-dietas
                cur.execute(sql_alimentos)
                filas = cur.fetchall()

        # Agrupar por alimento
        agrupado = {}

        for r in filas:
            id_al = r["id_alimento"]

            if id_al not in agrupado:
                agrupado[id_al] = {
                    "id_alimento": id_al,
                    "nombre": r["alimento"],
                    "cantidades": []
                }

            if r["cantidad"] is not None:
                agrupado[id_al]["cantidades"].append({
                    "dieta": r["dieta"],
                    "cantidad": r["cantidad"]
                })

        resultado = []

        for id_al, info in agrupado.items():
            lista = info["cantidades"]

            if not lista:  
                # No se usó en ninguna dieta
                resultado.append({
                    "id_alimento": id_al,
                    "nombre": info["nombre"],
                    "mayor": {
                        "cantidad": 0,
                        "dietas": [],
                        "totalUsadas": 0
                    },
                    "menor": {
                        "cantidad": 0,
                        "dietas": [],
                        "totalUsadas": 0
                    },
                    "promedio": 0,
                    "totalDietas": total_dietas
                })
                continue

            # Agrupar cantidades por valor para no repetir
            cantidades_dict = {}
            for x in lista:
                cantidades_dict.setdefault(x["cantidad"], []).append(x["dieta"])

            cantidades_ordenadas = sorted(cantidades_dict.items(), key=lambda x: x[0])

            menor_cant, dietas_menor = cantidades_ordenadas[0]
            mayor_cant, dietas_mayor = cantidades_ordenadas[-1]

            total_usadas = len(set(x["dieta"] for x in lista))  # dietas únicas

            promedio = sum(x["cantidad"] for x in lista) / len(lista)

            resultado.append({
                "id_alimento": id_al,
                "nombre": info["nombre"],
                "mayor": {
                    "cantidad": mayor_cant,
                    "dietas": dietas_mayor,
                    "totalUsadas": total_usadas
                },
                "menor": {
                    "cantidad": menor_cant,
                    "dietas": dietas_menor,
                    "totalUsadas": total_usadas
                },
                "promedio": round(promedio, 2),
                "totalDietas": total_dietas
            })

        return jsonify(resultado)

    except Exception as e:
        print("❌ Error en /reportes/alimentos:", e)
        return jsonify({"error": "Error interno del servidor"}), 500
      
      
if __name__ == "__main__":
    app.run(debug=True)
