#ACCEDER A LAS FUNCIONES DE FLASK
from flask import Flask, jsonify, request

#PARA FACILITAR EL CONSUMO DE LA API GENERADA
from flask_cors import CORS

#PARA DOCUMENTAR LAS RUTAS DEL CODIGO
from flasgger import Swagger

# IMPORTO EL DICCIONARIO CONFIG EN LA POSICION DEVELOPMENT PARA ACCEDER LA INFORMACION DE CONEXION DE LA
# BASE DE DATOS, DENTRO DE ESA CLASE HAY UN CLASSMETHOD QUE RETORNA LA CONEXION CON LA BASE DE DATOS
from config import config

from datetime import datetime ,date

#LIBRERIAS PARA LA FUNCIONALIDAD DE AUTENTICACION DE GOOGLE
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

import jwt
from datetime import datetime, timedelta, timezone
from functools import wraps

app = Flask(__name__)
app.secret_key = 'secretkey'
CORS(app)
CORS(app, resources={r"/api/*": {"origins": ["http://127.0.0.1:5502"]}})
Swagger(app)

# RUTA PRINCIPAL PARA VISUALIZAR SI EL SERVIDOR ESTA CORRIENDO CON NORMALIDAD

@app.route('/', methods=['GET'])
def ruta_principal():
    return jsonify({'Mensaje':'App funcionnando correctamente'})

#GENARADOR DE TOKEN
def generar_token(usuario, es_google=False):
    payload = {
        "id_usuario": usuario["numero_identificacion"],
        "nombre": usuario["nombre"],
        "correo": usuario["correo"],
        "es_google": es_google,
        "rol": usuario.get("rol", "Aprendiz"),
        "exp": datetime.now(timezone.utc) + timedelta(minutes=2)
    }
    token = jwt.encode(payload, app.secret_key, algorithm="HS256")
    return token

#DECORADORES DE EDUPORK
def token_requerido(f):
    @wraps(f)
    def decorador(*args, **kwargs):
        token = request.headers.get("Authorization")
        if not token:
            return jsonify({"Mensaje": "Token faltante"}), 401
        
        try:
            if "Bearer " in token:
                token = token.replace("Bearer ", "")
            
            datos = jwt.decode(token, app.secret_key, algorithms=["HS256"])
            request.usuario = datos
            print("Datos decodificados:", datos)
            
        except jwt.ExpiredSignatureError:
            return jsonify({"Mensaje": "Sesión expirada"}), 401
        except jwt.InvalidTokenError as e:
            print(f"Error decodificando token: {e}")
            return jsonify({"Mensaje": "Sesión inválida"}), 401
        
        return f(*args, **kwargs)
    return decorador

def rol_requerido(rol_requerido):
    def decorador(f):
        @wraps(f)
        def funcion_decorada(*args, **kwargs):
            try:
                # Verificar que el token requerido ya se haya ejecutado
                if not hasattr(request, 'usuario'):
                    return jsonify({"Mensaje": "Token requerido"}), 401
                
                usuario_token = request.usuario
                rol_usuario = usuario_token.get("rol")
                
                if not rol_usuario:
                    return jsonify({"Mensaje": "Rol no definido"}), 403
                
                # Verificar si el usuario tiene el rol requerido
                if rol_usuario != rol_requerido:
                    return jsonify({"Mensaje": "No tienes permisos para esta acción"}), 403
                
                return f(*args, **kwargs)
                
            except Exception as e:
                print(f"Error en verificación de rol: {str(e)}")
                return jsonify({"Mensaje": "Error interno del servidor"}), 500
        return funcion_decorada
    return decorador

# ------------------------------
# SECCION DE USUARIOS 
# ------------------------------

# RUTA PARA VALIDACION DE LOGIN
@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        if not data or 'correo' not in data or 'contraseña' not in data:
            return jsonify({'Mensaje': 'Datos incompletos'}), 400
        
        correo = data['correo']
        contraseña = data['contraseña']
        
        with config['development'].conn() as conn:
            with conn.cursor() as cur:
                cur.execute('SELECT id_usuario as numero_identificacion, nombre, correo, contrasena, rol FROM usuario WHERE correo = %s', (correo,))
                user = cur.fetchone()
        
        if user:
            if user['contrasena'] == contraseña:
                token = generar_token(user, es_google=False)
                return jsonify({
                    'Mensaje': 'Las credenciales son correctas',
                    'token': token,
                    'nombre': user['nombre'],
                    'numero_identificacion': user['numero_identificacion'],
                    'correo': user['correo'],
                    'rol': user['rol']
                }), 200
            else:
                return jsonify({'Mensaje': 'Contraseña incorrecta'}), 401
        else:
            return jsonify({'Mensaje': 'Usuario no encontrado'}), 404
        
    except Exception as err:
        print(f"Error en login: {err}")
        return jsonify({'Mensaje': 'Error al consultar Usuario'}), 500

# RUTA DE REGISTRO CON GOOGLE
@app.route('/api/auth/google', methods=['POST'])
def google_login():
    if not request.is_json:
        return jsonify({"status": "error", "message": "Formato JSON requerido"}), 400

    data = request.get_json()
    token = data.get('token')

    if not token:
        return jsonify({"status": "error", "message": "Token no recibido"}), 400

    try:
        idinfo = id_token.verify_oauth2_token(
            token,
            google_requests.Request(),
            "887853903603-sbo2ffg27v2o12navndev9okvno8t4fn.apps.googleusercontent.com"
        )

        email = idinfo['email']
        name = idinfo.get('name', '')
        proveedor = 'Google'

        conn = config['development'].conn()
        cursor = conn.cursor()


        cursor.execute("SELECT id_usuario_externo, nombre, rol FROM usuario_externo WHERE correo = %s", (email,))
        user = cursor.fetchone()

        if not user:

            cursor.execute("""
                INSERT INTO usuario_externo (correo, nombre, proveedor, rol)
                VALUES (%s, %s, %s, 'Aprendiz')""", (email, name, proveedor))
            id_usuario_externo = cursor.lastrowid
            conn.commit()
            rol = 'Aprendiz'
        else:
            id_usuario_externo = user["id_usuario_externo"]
            name = user["nombre"]
            rol = user["rol"]

        usuario = {
            "numero_identificacion": id_usuario_externo,
            "nombre": name,
            "correo": email,
            'rol': rol
        }
        token = generar_token(usuario, es_google=True)

        return jsonify({
            "status": "success",
            "correo": email,
            "nombre": name,
            "numero_identificacion": id_usuario_externo,
            "proveedor": proveedor,
            "rol": rol,
            "token": token
        })

    except ValueError:
        return jsonify({"status": "error", "message": "Token inválido"}), 400

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



#RUTA DE PERFIL
@app.route('/perfil', methods=['GET'])
@token_requerido
def perfil():
    try:
        usuario_token = request.usuario
        usuario = None
        
        with config['development'].conn() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT nombre, correo, rol FROM usuario WHERE id_usuario = %s", 
                          (usuario_token["id_usuario"],))
                usuario = cur.fetchone()
                
                if not usuario:
                    cur.execute("SELECT nombre, correo, rol FROM usuario_externo WHERE id_usuario_externo = %s", 
                              (usuario_token["id_usuario"],))
                    usuario = cur.fetchone()
        
        if not usuario:
            return jsonify({"Mensaje": "Usuario no encontrado"}), 404
        
        perfil_data = {
            "nombre": usuario_token["nombre"],
            "correo": usuario_token["correo"],
            "es_google": usuario_token.get("es_google", False),
            "rol": usuario_token.get("rol", "Aprendiz")
        }
        
        if not usuario_token.get("es_google", False):
            perfil_data["numero_identificacion"] = usuario_token["id_usuario"]
        
        return jsonify(perfil_data)
        
    except Exception as e:
        print(f"Error en perfil: {str(e)}")
        return jsonify({"Mensaje": "Error interno del servidor"}), 500

# ------------------------------
# SECCION DE GESTIONAR PORCINOS
# ------------------------------


# RUTA PARA CONSULTAR TODOS LOS PORCINOS
@app.route('/porcino', methods=['GET'])
def consulta_general_porcinos():
  """
  Consulta general de los porcinos registrados en la base de datos
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
    return jsonify({'Porcinos': informacion, 'Mensaje':'Listado de porcinos'})
    
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
        cur.execute('SELECT * FROM porcinos WHERE id_porcino = %s', (id))
    
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
      query += ' AND  %s BETWEEN (p.peso_final - 10) AND (p.peso_final + 10)'
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
    return jsonify({'Porcinos' : informacion, "Mensaje":'Lista de porcinos'})
  except Exception as err:
    print(err)
    return jsonify({'Mensaje': 'Error'})


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
    print(porcino)
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
        cur.execute('SELECT * FROM etapa WHERE id_raza = %s',
                    (id))
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
              cur.execute("DELETE FROM alimento_tiene_elemento WHERE id_alimento = %s", (id,))
              cur.execute("DELETE FROM alimentos WHERE id_alimento = %s", (id,))
              conn.commit()
      return jsonify({"mensaje": f"Alimento con id {id} eliminado correctamente"})
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
              
              id_usuario = 1022357255

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


# RUTA PARA ELIMINAR UN ALIMENTO POR SU ID
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
      return jsonify({"error": str(e)})

if __name__ == '__main__':
    app.run(debug=True)