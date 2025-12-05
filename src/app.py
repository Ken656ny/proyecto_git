#ACCEDER A LAS FUNCIONES DE FLASK
from flask import Flask, jsonify, request
from flask import Flask, render_template, request, jsonify
import pymysql
from config import DevelopmentConfig
from config import config

#PARA FACILITAR EL CONSUMO DE LA API GENERADA
from flask_cors import CORS
# Librerías que te faltan
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta, timezone
import jwt
import secrets
import random
import time

# Para Google Login
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

# Para usar decoradores @wraps
from functools import wraps

# Para enviar correos
from flask_mail import Mail, Message


#PARA DOCUMENTAR LAS RUTAS DEL CODIGO
from flasgger import Swagger


# IMPORTO EL DICCIONARIO CONFIG EN LA POSICION DEVELOPMENT PARA ACCEDER LA INFORMACION DE CONEXION DE LA
# BASE DE DATOS, DENTRO DE ESA CLASE HAY UN CLASSMETHOD QUE RETORNA LA CONEXION CON LA BASE DE DATOS
from config import config


app = Flask(__name__)
app.secret_key = 'secretkey'
CORS(app)
Swagger(app)
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'eduporkcontact@gmail.com'   
app.config['MAIL_PASSWORD'] = 'wddg sbke jvfh lqui'     
app.config['MAIL_DEFAULT_SENDER'] = ('Edupork', 'eduporkcontact@gmail.com')

mail = Mail(app)


# RUTA PRINCIPAL PARA VISUALIZAR SI EL SERVIDOR ESTA CORRIENDO CON NORMALIDAD

@app.route('/', methods=['GET'])
def ruta_principal():
    return jsonify({'Mensaje':'App funcionnando correctamente'})

#GENARADOR DE TOKEN
def generar_token(usuario, es_google=False):
    convertidor_ni = int(usuario["numero_identificacion"])

    payload = {
        "id_usuario": convertidor_ni,
        "nombre": usuario["nombre"],
        "correo": usuario["correo"],
        "es_google": es_google,
        "rol": usuario.get("rol", "Aprendiz"),
        "exp": datetime.now(timezone.utc) + timedelta(minutes=120)
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

                if not hasattr(request, 'usuario'):
                    return jsonify({"Mensaje": "Token requerido"}), 401
                
                usuario_token = request.usuario
                rol_usuario = usuario_token.get("rol")
                
                if not rol_usuario:
                    return jsonify({"Mensaje": "Rol no definido"}), 403
                

                if rol_usuario != rol_requerido:
                    return jsonify({"Mensaje": "No tienes permisos para esta sección"}), 403
                
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
                cur.execute('''
                    SELECT id_usuario, nombre, numero_identificacion, correo, contrasena, rol, 
                            intentos_fallidos, bloqueado_hasta, estado
                    FROM usuario WHERE correo = %s
                ''', (correo,))
                user = cur.fetchone()
        
        if not user:
            return jsonify({'Mensaje': 'Usuario no encontrado'}), 404

        if user['estado'] == 'Inactivo':
            return jsonify({'Mensaje': 'Usuario inactivo, contacte al administrador'}), 403

        if user['bloqueado_hasta'] and datetime.now() < user['bloqueado_hasta']:
            return jsonify({'Mensaje': 'Usuario bloqueado, intente más tarde'}), 403

        if check_password_hash(user['contrasena'], contraseña):
            with config['development'].conn() as conn:
                with conn.cursor() as cur:
                    cur.execute('''
                        UPDATE usuario 
                        SET intentos_fallidos = 0, bloqueado_hasta = NULL 
                        WHERE id_usuario = %s
                    ''', (user['id_usuario'],))
                    conn.commit()

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
            intentos = user['intentos_fallidos'] + 1
            bloqueado_hasta = None

            if intentos >= 3:
                bloqueado_hasta = datetime.now() + timedelta(minutes=15)
                intentos = 0  

            with config['development'].conn() as conn:
                with conn.cursor() as cur:
                    cur.execute('''
                        UPDATE usuario 
                        SET intentos_fallidos = %s, bloqueado_hasta = %s 
                        WHERE id_usuario = %s
                    ''', (intentos, bloqueado_hasta, user['id_usuario']))
                    conn.commit()

            return jsonify({'Mensaje': 'Contraseña incorrecta'}), 401

    except Exception as err:
        print(f"Error en login: {err}")
        return jsonify({'Mensaje': 'Error al consultar Usuario'}), 500

@app.route('/olvido-password', methods=['POST'])
def olvido_password():
    data = request.get_json()
    correo = data.get('correo')

    with config['development'].conn() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT id_usuario FROM usuario WHERE correo = %s", (correo,))
            user = cur.fetchone()

    if not user:
        return jsonify({'Mensaje': 'Correo no registrado'}), 404

    token = secrets.token_urlsafe(32)
    expiracion = datetime.now() + timedelta(minutes=15)

    with config['development'].conn() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                UPDATE usuario 
                SET reset_token = %s, reset_token_expira = %s 
                WHERE id_usuario = %s
            """, (token, expiracion, user['id_usuario']))
            conn.commit()

    enlace = f"http://127.0.0.1:5502/src/templates/recuperarpass.html?token={token}"

    msg = Message("Recuperación de contraseña - Edupork", recipients=[correo])
    msg.body = f"""
    Hola,
    Has solicitado recuperar tu contraseña en Edupork.
    Haz clic en el siguiente enlace para restablecerla (válido por 15 minutos):

    {enlace}

    Si no solicitaste este cambio, ignora este correo.
    """
    mail.send(msg)

    return jsonify({'Mensaje': 'Se envió un enlace de recuperación al correo'}), 200

@app.route('/recuperar-password', methods=['POST'])
def recuperar_password():
    data = request.get_json()
    token = data.get('token')
    nueva_contrasena = data.get('nueva_contrasena')

    with config['development'].conn() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT id_usuario, reset_token_expira 
                FROM usuario WHERE reset_token = %s
            """, (token,))
            user = cur.fetchone()

    if not user or datetime.now() > user['reset_token_expira']:
        return jsonify({'Mensaje': 'Token inválido o expirado'}), 400

    hash_pass = generate_password_hash(nueva_contrasena)
    with config['development'].conn() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                UPDATE usuario 
                SET contrasena = %s, reset_token = NULL, reset_token_expira = NULL
                WHERE id_usuario = %s
            """, (hash_pass, user['id_usuario']))
            conn.commit()

    return jsonify({'Mensaje': 'Contraseña actualizada correctamente'}), 200


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

        with config['development'].conn() as conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT id_usuario_externo, nombre, rol FROM usuario_externo WHERE correo = %s", (email,))
                user = cursor.fetchone()

                if not user:
                    cursor.execute("""
                        INSERT INTO usuario_externo (correo, nombre, proveedor, rol)
                        VALUES (%s, %s, %s, 'Aprendiz')
                    """, (email, name, proveedor))
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
        }), 200

    except ValueError:
        return jsonify({"status": "error", "message": "Token inválido"}), 400
    except Exception as err:
        print(f"Error en google_login: {err}")
        return jsonify({"status": "error", "message": "Error interno"}), 500

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

        if not user:
            return jsonify({'Mensaje': 'Datos no recibidos'}), 400

        nom = user['nombre']
        correo = user['correo']
        contra = user['contraseña']
        estado = user['estado']
        id_tipo_iden = user['id_tipo_identificacion']
        num_identi = user['numero_identificacion']

        contra_hash = generate_password_hash(contra)

        with config['development'].conn() as conn:
            with conn.cursor() as cur:
                cur.execute('SELECT * FROM usuario WHERE correo = %s', (correo,))
                if cur.fetchone():
                    return jsonify({'Mensaje': 'El correo ya está registrado'}), 409

                cur.execute('SELECT * FROM usuario WHERE numero_identificacion = %s', (num_identi))
                if cur.fetchone():
                  return jsonify({'Mensaje': 'El número de identificación está en uso'}), 409
                
                cur.execute('''
                    INSERT INTO usuario (nombre, numero_identificacion, correo, contrasena, estado, rol, id_tipo_identificacion)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                ''', (nom, num_identi, correo, contra_hash, estado, "Aprendiz", id_tipo_iden))
                conn.commit()

        return jsonify({'Mensaje': 'Usuario registrado exitosamente'}), 201

  except Exception as err:
    print(f"Error en registro_usuarios: {err}")
    return jsonify({'Mensaje': 'Error, el usuario no pudo ser registrado'}), 500

codigos_verificacion = {}

@app.route('/enviar_codigo', methods=['POST'])
def enviar_codigo():
    data = request.json
    email = data.get("email")
    if not email:
        return jsonify({"error": "Falta el correo"}), 400

    codigo = random.randint(100000, 999999)
    codigos_verificacion[email] = {
        "codigo": codigo,
        "expira": time.time() + 300  
    }

    msg = Message("Código de verificación", recipients=[email])
    msg.html = f"""
        <h3>Verificación de correo</h3>
        <p>Tu código es: <b>{codigo}</b></p>
        <p>Este código expira en 5 minutos.</p>
    """
    mail.send(msg)

    return jsonify({"mensaje": "Código enviado al correo"}), 200

@app.route('/validar_codigo', methods=['POST'])
def validar_codigo():
    data = request.json
    email = data.get("email")
    codigo_usuario = data.get("codigo")

    if not email or not codigo_usuario:
        return jsonify({"error": "Datos incompletos"}), 400

    registro = codigos_verificacion.get(email)
    if not registro:
        return jsonify({"error": "No hay código para este correo"}), 400

    if time.time() > registro["expira"]:
        return jsonify({"error": "Código expirado"}), 400

    if str(registro["codigo"]) == str(codigo_usuario):
        return jsonify({"mensaje": "Correo validado correctamente"}), 200

    return jsonify({"error": "Código incorrecto"}), 400


#RUTA DE PERFIL
@app.route('/perfil', methods=['GET'])
@token_requerido
def perfil():
    try:
        usuario_token = request.usuario
        user_id = usuario_token["id_usuario"] 
        es_google = usuario_token.get("es_google", False)
        
        datos_usuario_db = None
        numero_identificacion = None 
        with config['development'].conn() as conn:
            with conn.cursor() as cur:
                
                if not es_google:
                    cur.execute("""
                        SELECT nombre, correo, rol, numero_identificacion 
                        FROM usuario 
                        WHERE numero_identificacion = %s
                    """, (user_id,))
                    datos_usuario_db = cur.fetchone()
                    
                    if datos_usuario_db:
                        nombre = datos_usuario_db['nombre']
                        correo = datos_usuario_db['correo']
                        rol = datos_usuario_db['rol']
                        numero_identificacion = datos_usuario_db['numero_identificacion'] 
                else:
                    cur.execute("""
                        SELECT nombre, correo, rol 
                        FROM usuario_externo 
                        WHERE id_usuario_externo = %s
                    """, (user_id,))
                    datos_usuario_db = cur.fetchone()
                    
                    if datos_usuario_db:
                        nombre = datos_usuario_db['nombre']
                        correo = datos_usuario_db['correo']
                        rol = datos_usuario_db['rol']

                if not datos_usuario_db:
                    return jsonify({"Mensaje": "Usuario no encontrado"}), 404


        perfil_data = {
            "nombre": nombre,
            "correo": correo,
            "rol": rol,
            "es_google": es_google,
        }

        if numero_identificacion is not None and not es_google:
            perfil_data["numero_identificacion"] = numero_identificacion

        return jsonify(perfil_data)

    except Exception as e:
        print(f"Error en perfil: {str(e)}")
        return jsonify({"Mensaje": "Error interno del servidor"}), 500

# ------------------------------
# SECCION DE GESTIONAR PORCINOS
# ------------------------------

# RUTA PARA CONSULTAR TODOS LOS PORCINOS
@app.route('/porcino', methods=['GET'])
@token_requerido
@rol_requerido('Admin')
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
@token_requerido
@rol_requerido('Admin')
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
@token_requerido
@rol_requerido('Admin')
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
@token_requerido
@rol_requerido('Admin')
def historial_pesos():
  """
  Consultar el historial de pesos de los porcinos registrados
  ---
  tags:
    - Porcinos
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
                    """)
        historial = cur.fetchall()
        if historial:
          return jsonify({'Historial': historial, 'Mensaje': 'Listado del historial de los pesos de los porcinos registrados'})
        else:
          return jsonify({'Mensaje': 'No hay historial de pesos registrados'})
  except Exception as err:
    print(err)
    return jsonify({'Mensaje': 'Error'}), 500


@app.route('/porcino/historial_pesos/conteo_transacciones', methods=['GET'])
@token_requerido
@rol_requerido('Admin')
def conteo_transacciones():
    """
    Conteo de transacciones de pesos actualizados
    ---
    tags:
      - Porcinos
    responses:
      200:
        description: Número de transacciones registradas en la base de datos
    """
    try:
        with config['development'].conn() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT COUNT(*) FROM transaccion_peso;")
                conteo = cur.fetchone()
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
@token_requerido
@rol_requerido('Admin')
def actualizar_peso_porcinos():
  """
  Registro de transaccion de peso y actualizacion del peso del porcino
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
@token_requerido
@rol_requerido('Admin')
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
    p_ini =   porcino['peso_inicial']
    p_fin =   porcino['peso_final']
    fec_nac = porcino['fecha_nacimiento']
    sexo =    porcino['sexo']
    id_ra =   porcino['id_raza']
    id_eta =  porcino['id_etapa']
    estado =  porcino['estado']
    descripcion = porcino['descripcion']
    
    with config['development'].conn() as conn:
      with conn.cursor() as cur:
        cur.execute('INSERT INTO porcinos (peso_inicial,peso_final,fecha_nacimiento,sexo,id_raza,id_etapa,estado,descripcion,id_porcino) values (%s,%s,%s,%s,%s,%s,%s,%s,%s)',
                  (p_ini,p_fin,fec_nac,sexo,id_ra,id_eta,estado,descripcion,id))
        conn.commit()
    
    return jsonify({'Mensaje': f'Porcino con id {id} registrado'})
  
  except Exception as err:
    print(err)
    
    return jsonify({'Mensaje':'Error el porcino no pudo ser registrado'})


# RUTA PARA ACTUALIZAR LA INFORMACION DE UN PORCINO POR SU ID
@app.route('/porcino/<int:id>', methods=['PUT'])
@token_requerido
@rol_requerido('Admin')
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
@token_requerido
@rol_requerido('Admin')
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
@token_requerido
@rol_requerido('Admin')
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
@token_requerido
@rol_requerido('Admin')
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
@token_requerido
@rol_requerido('Admin')
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
@token_requerido
@rol_requerido('Admin')
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
@token_requerido
@rol_requerido('Admin')
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
@token_requerido
@rol_requerido('Admin')
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
@token_requerido
@rol_requerido('Admin')
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
@token_requerido
@rol_requerido('Admin')
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
@token_requerido
@rol_requerido('Admin')
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
@token_requerido
@rol_requerido('Admin')
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
@token_requerido
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
@token_requerido
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
@token_requerido
@rol_requerido('Admin')
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
@token_requerido
@rol_requerido('Admin')
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

@app.route("/usuarios", methods=["PUT"])
def editar_usuario():

    data = request.json
    if not data or "id" not in data or "tipo" not in data:
        return jsonify({"error": "Datos incompletos"}), 400

    try:
        with config['development'].conn() as conn:
            with conn.cursor() as cur:

                # ================================
                #   USUARIO INTERNO
                # ================================
                if data["tipo"] == "Interno":

                    # Si manda ambos, estado y rol → actualizar los dos
                    if "estado" in data and "rol" in data:
                        sql = """
                            UPDATE usuario
                            SET estado=%s, rol=%s
                            WHERE id_usuario=%s
                        """
                        cur.execute(sql, (data["estado"], data["rol"], data["id"]))

                    # Solo estado
                    elif "estado" in data:
                        sql = """
                            UPDATE usuario
                            SET estado=%s
                            WHERE id_usuario=%s
                        """
                        cur.execute(sql, (data["estado"], data["id"]))

                    # Solo rol
                    elif "rol" in data:
                        sql = """
                            UPDATE usuario
                            SET rol=%s
                            WHERE id_usuario=%s
                        """
                        cur.execute(sql, (data["rol"], data["id"]))

                # ================================
                #   USUARIO GOOGLE
                # ================================
                elif data["tipo"] == "Google":

                    # Google solo puede cambiar rol (tu tabla no tiene 'estado')
                    if "rol" in data:
                        sql = """
                            UPDATE usuario_externo
                            SET rol=%s
                            WHERE id_usuario_externo=%s
                        """
                        cur.execute(sql, (data["rol"], data["id"]))

                else:
                    return jsonify({"error": "Tipo inválido"}), 400

                conn.commit()

        return jsonify({"message": "Usuario actualizado correctamente"})

    except Exception as e:
        print("❌ Error:", e)
        return jsonify({"error": "Error interno"}), 500
  
# ----------------------------------------------------
# API: BUSCAR USUARIO POR ID
# ----------------------------------------------------
@app.route('/usuarios/buscar', methods=['GET'])
def buscar_usuario():
    id_usuario = request.args.get("id")

    if not id_usuario:
        return jsonify({"error": "Falta el ID"}), 400

    try:
        with config['development'].conn() as conn:
            with conn.cursor(pymysql.cursors.DictCursor) as cur:

                # Buscar interno
                cur.execute("""
                    SELECT id_usuario AS id, nombre, correo, estado, rol, 'Interno' AS tipo
                    FROM usuario
                    WHERE id_usuario = %s
                """, (id_usuario,))
                interno = cur.fetchone()

                if interno:
                    return jsonify(interno)

                # Buscar externo
                cur.execute("""
                    SELECT id_usuario_externo AS id, nombre, correo, 'Activo' AS estado, rol, 'Google' AS tipo
                    FROM usuario_externo
                    WHERE id_usuario_externo = %s
                """, (id_usuario,))
                externo = cur.fetchone()

                if externo:
                    return jsonify(externo)

                return jsonify({"error": "Usuario no encontrado"}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500
      
      
@app.route("/usuarios", methods=["DELETE"])
def eliminar_usuario():
    id_usuario = request.args.get("id")
    tipo = request.args.get("tipo")

    if not id_usuario or not tipo:
        return jsonify({"error": "Faltan parámetros"}), 400

    try:
        with config['development'].conn() as conn:
            with conn.cursor() as cur:

                # ---------------------------------------
                # 1. Validar que el usuario exista
                # ---------------------------------------
                if tipo == "Interno":
                    cur.execute("SELECT * FROM usuario WHERE id_usuario=%s", (id_usuario,))
                else:  # Google
                    cur.execute("SELECT * FROM usuario_externo WHERE id_usuario_externo=%s", (id_usuario,))

                existe = cur.fetchone()
                if not existe:
                    return jsonify({"error": "NO_EXISTE"}), 404

                # ---------------------------------------
                # 2. Validar dependencias (si aplica)
                # ---------------------------------------
                # verifica si tiene alimentos registrados
                cur.execute("SELECT COUNT(*) AS total FROM alimentos WHERE id_usuario=%s", (id_usuario,))
                if cur.fetchone()["total"] > 0:
                    return jsonify({
                        "error": "NO_SE_PUEDE",
                        "reason": "El usuario tiene alimentos registrados"
                    }), 409

                # verifica si tiene dietas registradas
                cur.execute("SELECT COUNT(*) AS total FROM dietas WHERE id_usuario=%s", (id_usuario,))
                if cur.fetchone()["total"] > 0:
                    return jsonify({
                        "error": "NO_SE_PUEDE",
                        "reason": "El usuario tiene dietas registradas"
                    }), 409

                # ---------------------------------------
                # 3. Borrar según tipo
                # ---------------------------------------
                if tipo == "Interno":
                    cur.execute("DELETE FROM usuario WHERE id_usuario=%s", (id_usuario,))
                elif tipo == "Google":
                    cur.execute("DELETE FROM usuario_externo WHERE id_usuario_externo=%s", (id_usuario,))
                else:
                    return jsonify({"error": "Tipo inválido"}), 400

                conn.commit()

        return jsonify({"message": "Usuario eliminado correctamente"})

    except Exception as e:
        print("❌ Error eliminando usuario:", e)
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
