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




app = Flask(__name__)
app.secret_key = 'secretkey'
CORS(app, supports_credentials=True)
Swagger(app)

cargar_imagenes = os.path.join(os.path.dirname(__file__), "static", "imagenes_base_de_datos")
os.makedirs(cargar_imagenes, exist_ok=True)
app.config["cargar_imagenes"] = cargar_imagenes





@app.route('/', methods=['GET'])
def ruta_principal():
    return jsonify({'Mensaje':'App funcionnando correctamente'})


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
    
    conex = config['development'].conn()
    cursor = conex.cursor()
    cursor.execute('SELECT correo, contrasena FROM usuario WHERE correo = %s', (correo))
    user = cursor.fetchone()
    cursor.close()
    conex.close()
    
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
    print(user)
    num_identi = user['numero_identificacion']
    print(num_identi)
    nom = user['nombre']
    correo = user['correo']
    contra = user['contraseña']
    estado = user['estado']
    id_tipo_iden = user['id_tipo_identificacion']
    
    conex = config['development'].conn()
    cursor = conex.cursor()
    cursor.execute('INSERT INTO usuario (nombre,correo,contrasena,estado,id_tipo_identificacion,id_usuario) values (%s,%s,%s,%s,%s,%s)',
                  (nom,correo,contra,estado,id_tipo_iden,num_identi))
    conex.commit()
    cursor.close()
    conex.close()
    return jsonify({'Mensaje': f'Usuario registrado'})
  
  except Exception as err:
    print(err)
    return jsonify({'Mensaje':'Error el usuario no pudo ser registrado'})


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
    conex = config['development'].conn()
    cursor = conex.cursor()
    cursor.execute('SELECT * FROM porcinos WHERE id_porcino = %s', (id,))
    porcino = cursor.fetchone()
    cursor.close()
    conex.close()
    if porcino:
      return jsonify({'Porcinos': porcino, 'Mensaje': f'Porcino con {id} consultado'})
    else:
      print('Porcino no encontrado')
      return jsonify({'Mensaje':'Porcino no encontrado'})
  except Exception as err:
    print(err)
    return jsonify({'Mensaje': 'Error al consultar porcino'})

# REGISTRAR A UN PORCINO

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
    conn = config['development'].conn()
    cur = conn.cursor()
    cur.execute('SELECT * FROM raza')
    info = cur.fetchall()
    conn.close()
    cur.close()
    if info:
      razas = []
      for i in info:
        raza = {
          "id_raza" : i[0],
          "nombre" : i[1],
          "descripcion" : i[2]
        }
        razas.append(raza)
      return jsonify({'Mensaje': 'Listado de razas', 'razas': razas})
    else:
      return jsonify({'Mensaje': 'No hay razas registradas'})
  except Exception as err:
    print(err)
    return jsonify({'Mesaje':'Error en la base de datos'})

@app.route('/raza', methods = ['POST'])
def registrar_raza():
  """
  Registrar nueva raza en la base de datos
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
    
    conn = config['development'].conn()
    cur = conn.cursor()
    cur.execute('INSERT INTO raza VALUES (null,%s,%s)',
                (nombre,desc))
    conn.commit()
    conn.close()
    cur.close()
    return jsonify({'Mensaje': 'Raza registrada correctamente'})
  except Exception as err:
    print(err)
    return jsonify({'Mesaje':'Error en la base de datos'})

@app.route('/raza/<int:id>', methods = ['PUT'])
def actualizar_raza(id):
  """
  Actualizar raza por id
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
    
    conn = config['development'].conn()
    cur = conn.cursor()
    cur.execute('UPDATE raza SET nombre = %s, descripcion = %s WHERE id_raza = %s',
                (nombre,desc,id))
    conn.commit()
    conn.close()
    cur.close()
    return jsonify({'Mensaje': 'Raza actulizada correctamente'})
  except Exception as err:
    print(err)
    return jsonify({'Mesaje':'Error en la base de datos'})

@app.route('/raza/<int:id>', methods = ['DELETE'])
def eliminar_raza(id):
  """
  Eliminar registro por ID de una raza registrado en la base de datos
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
    conn = config['development'].conn()
    cur = conn.cursor()
    cur.execute('DELETE FROM raza WHERE id_raza = %s',
                (id))
    conn.commit()
    conn.close()
    cur.close()
    return jsonify({'Mensaje': 'Raza eliminada correctamente'})
  except Exception as err:
    print(err)
    return jsonify({'Mesaje':'Error en la base de datos'})

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
    conn = config['development'].conn()
    cur = conn.cursor()
    cur.execute('SELECT * FROM etapa_vida')
    info = cur.fetchall()
    conn.close()
    cur.close()
    if info:
      etapas = []
      for i in info:
        etapa = {
          "id_etapa" : i[0],
          "nombre" : i[1],
          "descripcion" : i[2]
        }
        etapas.append(etapa)
      return jsonify({'Mensaje': 'Lista de etapas registradas', 'etapas': etapas})
    else:
      return jsonify({'Mensaje': 'No hay etapas registradas'})
  except Exception as err:
    print(err)
    return jsonify( {'Mensaje': 'Error en la base de datos'} )

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
    
    conn = config['development'].conn()
    cur = conn.cursor()
    cur.execute('INSERT INTO etapa_vida VALUES (null,%s,%s)',
                (nombre,desc))
    conn.commit()
    conn.close()
    cur.close()
    return jsonify({'Mensaje': 'Etapa de vida registrada correctamente'})
  except Exception as err:
    print(err)
    return jsonify({'Mesaje':'Error en la base de datos'})

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
    
    conn = config['development'].conn()
    cur = conn.cursor()
    cur.execute('UPDATE etapa_vida SET nombre = %s, descripcion = %s WHERE id_etapa = %s',
                (nombre,desc,id))
    conn.commit()
    conn.close()
    cur.close()
    return jsonify({'Mensaje': 'Raza actulizada correctamente'})
  except Exception as err:
    print(err)
    return jsonify({'Mesaje':'Error en la base de datos'})

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
    conn = config['development'].conn()
    cur = conn.cursor()
    cur.execute('DELETE FROM etapa_vida WHERE id_etapa = %s',
                (id))
    conn.commit()
    conn.close()
    cur.close()
    return jsonify({'Mensaje': 'Etapa de vida eliminada correctamente'})
  except Exception as err:
    print(err)
    return jsonify({'Mesaje':'Error en la base de datos'})

# ------------------
# BACKEND CRISTIAN
# ------------------
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

  
@app.route("/eliminar_alimento/<int:id>", methods=["DELETE"])
def eliminar_alimento(id):
  try:
      with config['development'].conn() as conn:
          with conn.cursor() as cur:
              cur.execute("DELETE FROM alimento_tiene_elemento WHERE id_alimento = %s", (id,))
              cur.execute("DELETE FROM alimentos WHERE id_alimento = %s", (id,))
              conn.commit()
      return jsonify({"mensaje": f"Alimento con id {id} eliminado correctamente"})
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
