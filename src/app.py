#ACCEDER A LAS FUNCIONES DE FLASK
from flask import Flask, jsonify, request, make_response

#PARA FACILITAR EL CONSUMO DE LA API GENERADA
from flask_cors import CORS

#PARA DOCUMENTAR LAS RUTAS DEL CODIGO
from flasgger import Swagger
# IMPORTO EL DICCIONARIO CONFIG EN LA POSICION DEVELOPMENT PARA ACCEDER LA INFORMACION DE CONEXION DE LA
# BASE DE DATOS, DENTRO DE ESA CLASE HAY UN CLASSMETHOD QUE RETORNA LA CONEXION CON LA BASE DE DATOS
from config import config
from pymysql.err import IntegrityError
import io,os
import json
from werkzeug.utils import secure_filename

from datetime import datetime ,date

#IMPORTO PARA LA REALIZACION DE PDF
from reportlab.lib.pagesizes import letter
from reportlab.lib.pagesizes import landscape
from reportlab.platypus import (SimpleDocTemplate, Table, TableStyle, Paragraph,Spacer, Image,PageBreak)
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet

import random


# grafica en el pdf
import matplotlib
matplotlib.use('Agg')  # backend sin GUI, no abre ventanas
import matplotlib.pyplot as plt


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
              JOIN etapa_vida e ON p.id_etapa = e.id_etapa
              ORDER BY id_porcino ASC
              """)
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

@app.route("/porcino/historial_pesos/transaccion/<int:id>", methods = ['GET'])
def consulta_indi_transaccion(id):
  """
  Consultar individualmente la transaccion de pesos
  ---
  tags:
    - Porcinos Historial
  responses:
    200:
      description: Lista de la transaccion de pesos registrada
  """
  try:
    with config['development'].conn() as conn:
      with conn.cursor() as cur:
        cur.execute("""
                    SELECT tp.id_documento,tp.fecha_documento,tp.fecha_pesaje,tp.id_porcino,tp.peso_final,u.nombre,tp.descripcion
                    FROM transaccion_peso tp
                    JOIN usuario u
                    ON tp.id_usuario = u.id_usuario
                    WHERE tp.id_documento = %s
                    ORDER BY fecha_documento DESC
                    """, (id))
        historial = cur.fetchone()
        if historial:
          return jsonify({'Historial': historial, 'Mensaje': 'Transaccion Consultada'})
        else:
          return jsonify({'Mensaje': 'No se econtró la transacción'})
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

@app.route("/PDF_transacciones")
def reporte_transacciones():

  try:
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
    except Exception as err:
      print(err)
      return jsonify({'Error al Consultar los Porcinos'})

    buffer = io.BytesIO()
    pdf = SimpleDocTemplate(buffer, pagesize=landscape(letter))
    elementos = []
    codigo = random.randint(0,9999)
    styles = getSampleStyleSheet()
    style_normal = styles["Normal"]
    style_normal.fontSize = 9  # si quieres ajustar tamaño
    style_normal.leading = 11  # espacio entre líneas
    # ================================================
    #               ENCABEZADO PERSONALIZADO
    # ================================================
    ruta_logo = os.path.join("src/static/iconos/", "Logo_edupork.png")

    if os.path.exists(ruta_logo):
        logo = Image(ruta_logo, width=140, height=60)
    else:
        logo = Paragraph("LOGO", styles["Title"])
    
    titulo_central = [
        Paragraph('<font color="#333333"><b>Edupork: Gestion de Alimentacion Porcina</b></font>', styles["Title"]),
        Paragraph('<para align="center"><font color="#333333">Informe de Transacciones de peso </font></para>',styles["Normal"])
    ]

    info_derecha = [
        Paragraph(f'<font color="#333333"><b>CÓDIGO:</b> {codigo}</font>', styles["Normal"]),
        Paragraph('<font color="#333333"><b>VERSIÓN:</b> 1</font>', styles["Normal"]),
    ]

    ruta_logo_sena = os.path.join("src/static/iconos/", "logo_sena.png")

    if os.path.exists(ruta_logo_sena):
        logo_sena = Image(ruta_logo_sena, width=60, height=60)
    else:
        logo_sena = Paragraph("LOGO_SENA", styles["Title"])
    
    tabla_encabezado = Table(
        [
            [logo, titulo_central, info_derecha, logo_sena]
        ],
        colWidths=[120, 270, 100, 80]
    )

    tabla_encabezado.setStyle(TableStyle([
        ("BOX", (0, 0), (-1, -1), 1, "#333333"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("ALIGN", (1, 0), (1, 0), "CENTER"),
        ("LEFTPADDING", (1, 0), (1, 0), 10),
        ("RIGHTPADDING", (2, 0), (2, 0), 10),
    ]))

    elementos.append(tabla_encabezado)
    elementos.append(Spacer(1, 20))

    # ================================================
    #                TABLA DE PORCINOS
    # ================================================
    elementos.append(Paragraph('<font color="#333333"><b>Listado de Transacciones de peso</b></font>', styles["Title"]))
    
    encabezado = ["ID Documento", "Fecha Documento", "Fecha Pesaje", "ID Porcino", "Peso Final", "Nombre Usuario", "Descripcion"]
    tabla_data = [encabezado]

    for h in historial:
      descripcion_limpia = " ".join(str(h["descripcion"]).split())

      tabla_data.append([
          h["id_documento"],
          h["fecha_documento"],
          h["fecha_pesaje"],
          h["id_porcino"],
          h["peso_final"],
          h["nombre"],
          Paragraph(descripcion_limpia, style_normal),
      ])



    verde_header = colors.HexColor("#62804B")
    verde_fila = colors.HexColor("#E7F6DD")

    tabla = Table(tabla_data, colWidths=[80, 110, 90, 70, 70, 100, 200])

    # ================================
    #    ESTILOS BASE DE LA TABLA
    # ================================
    estilos_tabla = [
        ("BACKGROUND", (0, 0), (-1, 0), verde_header),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor('#ffffff')),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 12),

        ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#9BC38A")),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#AACF96")),

        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),

        ("FONTSIZE", (0, 1), (-1, -1), 10),
    ]

    # ======================================
    #      ALTERNAR TODAS LAS FILAS
    # ======================================
    for i in range(1, len(tabla_data)):
        if i % 2 == 1:
            estilos_tabla.append(("BACKGROUND", (0, i), (-1, i), verde_fila))

    tabla.setStyle(TableStyle(estilos_tabla))

    elementos.append(tabla)

    # ================================================
    #                GENERAR PDF
    # ================================================
    pdf.build(elementos)

    pdf_value = buffer.getvalue()
    buffer.close()

    response = make_response(pdf_value)
    response.headers["Content-Type"] = "application/pdf"
    response.headers["Content-Disposition"] = 'inline; filename="reporte_transacciones.pdf"'

    return response

  except Exception as err:
    print(err)
    return jsonify({'Mensaje': 'Error al generar el pdf'})


@app.route("/PDF_transacciones/<int:id>")
def reporte_transacciones_por_porcino(id):

  try:
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
    except Exception as err:
      print(err)
      return jsonify({'Error al Consultar los Porcinos'})

    buffer = io.BytesIO()
    pdf = SimpleDocTemplate(buffer, pagesize=landscape(letter))
    elementos = []
    codigo = random.randint(0,9999)
    styles = getSampleStyleSheet()
    style_normal = styles["Normal"]
    style_normal.fontSize = 9  # si quieres ajustar tamaño
    style_normal.leading = 11  # espacio entre líneas
    # ================================================
    #               ENCABEZADO PERSONALIZADO
    # ================================================
    ruta_logo = os.path.join("src/static/iconos/", "Logo_edupork.png")

    if os.path.exists(ruta_logo):
        logo = Image(ruta_logo, width=140, height=60)
    else:
        logo = Paragraph("LOGO", styles["Title"])
    
    titulo_central = [
        Paragraph('<font color="#333333"><b>Edupork: Gestion de Alimentacion Porcina</b></font>', styles["Title"]),
        Paragraph('<para align="center"><font color="#333333">Informe de Transacciones de peso</font></para>',styles["Normal"])
    ]

    info_derecha = [
        Paragraph(f'<font color="#333333"><b>CÓDIGO:</b> {codigo}</font>', styles["Normal"]),
        Paragraph('<font color="#333333"><b>VERSIÓN:</b> 1</font>', styles["Normal"]),
    ]

    ruta_logo_sena = os.path.join("src/static/iconos/", "logo_sena.png")

    if os.path.exists(ruta_logo_sena):
        logo_sena = Image(ruta_logo_sena, width=60, height=60)
    else:
        logo_sena = Paragraph("LOGO_SENA", styles["Title"])
    
    tabla_encabezado = Table(
        [
            [logo, titulo_central, info_derecha, logo_sena]
        ],
        colWidths=[120, 270, 100, 80]
    )

    tabla_encabezado.setStyle(TableStyle([
        ("BOX", (0, 0), (-1, -1), 1, "#333333"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("ALIGN", (1, 0), (1, 0), "CENTER"),
        ("LEFTPADDING", (1, 0), (1, 0), 10),
        ("RIGHTPADDING", (2, 0), (2, 0), 10),
    ]))

    elementos.append(tabla_encabezado)
    elementos.append(Spacer(1, 20))

    # ================================================
    #                TABLA DE PORCINOS
    # ================================================
    elementos.append(Paragraph(f'<font color="#333333"><b>Listado de Transacciones de peso del porcino {id}</b></font>', styles["Title"]))
    
    encabezado = ["ID Documento", "Fecha Documento", "Fecha Pesaje", "ID Porcino", "Peso Final", "Nombre Usuario", "Descripcion"]
    tabla_data = [encabezado]

    for h in historial:
      descripcion_limpia = " ".join(str(h["descripcion"]).split())

      tabla_data.append([
          h["id_documento"],
          h["fecha_documento"],
          h["fecha_pesaje"],
          h["id_porcino"],
          h["peso_final"],
          h["nombre"],
          Paragraph(descripcion_limpia, style_normal),
      ])



    verde_header = colors.HexColor("#62804B")
    verde_fila = colors.HexColor("#E7F6DD")

    tabla = Table(tabla_data, colWidths=[80, 110, 90, 70, 70, 100, 200])

    # ================================
    #    ESTILOS BASE DE LA TABLA
    # ================================
    estilos_tabla = [
        ("BACKGROUND", (0, 0), (-1, 0), verde_header),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor('#ffffff')),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 12),

        ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#9BC38A")),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#AACF96")),

        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),

        ("FONTSIZE", (0, 1), (-1, -1), 10),
    ]

    # ======================================
    #      ALTERNAR TODAS LAS FILAS
    # ======================================
    for i in range(1, len(tabla_data)):
        if i % 2 == 1:
            estilos_tabla.append(("BACKGROUND", (0, i), (-1, i), verde_fila))

    tabla.setStyle(TableStyle(estilos_tabla))

    elementos.append(tabla)

    # ================================================
    #                GENERAR PDF
    # ================================================
    pdf.build(elementos)

    pdf_value = buffer.getvalue()
    buffer.close()

    response = make_response(pdf_value)
    response.headers["Content-Type"] = "application/pdf"
    response.headers["Content-Disposition"] = 'inline; filename="reporte_transacciones.pdf"'

    return response

  except Exception as err:
    print(err)
    return jsonify({'Mensaje': 'Error al generar el pdf'})



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
          id_porcino = cur.lastrowid
          cur.execute(f"""
                      INSERT INTO notificaciones (id_usuario_destinatario, id_usuario_origen, titulo, mensaje, tipo)
                      VALUES (3, 3, 'Registro de Porcino',
                      CONCAT('Se registró un nuevo porcino con ID {id_porcino}'),'Ingreso');
                      """)
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
        cur.execute(f"""
                      INSERT INTO notificaciones (id_usuario_destinatario, id_usuario_origen, titulo, mensaje, tipo)
                      VALUES (3, 3, 'Actualizacion de la información del Porcino',
                      CONCAT('Se actualizo la información del porcino con ID {id}'),'Actualización');
                      """)
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
        cur.execute(f"""
                      INSERT INTO notificaciones (id_usuario_destinatario, id_usuario_origen, titulo, mensaje, tipo)
                      VALUES (3, 3, 'Eliminación de la información del Porcino',
                      CONCAT('Se eliminó la información del porcino con ID {id}'),'Eliminación');
                      """)
        conn.commit()
    return jsonify({'Mensaje': f'El porcino con id {id} ha sido eliminado correctamente'})
    
  except Exception as err:
    print(err)
    return jsonify({'Mensaje': f'Error al eliminar el porcino con id {id}'})

#Ruta para generar PDF del listado de porcinos
@app.route("/PDF_porcinos")
def reporte_porcinos():

  try:
    try:
      with config['development'].conn() as conn:
        with conn.cursor() as cur:
          cur.execute("""SELECT id_porcino,peso_inicial,peso_final,fecha_nacimiento,sexo,r.nombre as raza,e.nombre as etapa,estado,p.descripcion
              FROM porcinos p 
              JOIN raza r ON p.id_raza = r.id_raza 
              JOIN etapa_vida e ON p.id_etapa = e.id_etapa
              ORDER BY id_porcino ASC
              """)
          porcinos = cur.fetchall()
    except Exception as err:
      print(err)
      return jsonify({'Error al Consultar los Porcinos'})

    buffer = io.BytesIO()
    pdf = SimpleDocTemplate(buffer, pagesize=landscape(letter))
    elementos = []
    codigo = random.randint(0,9999)
    styles = getSampleStyleSheet()


    # ================================================
    #               ENCABEZADO PERSONALIZADO
    # ================================================
    ruta_logo = os.path.join("src/static/iconos/", "Logo_edupork.png")

    if os.path.exists(ruta_logo):
        logo = Image(ruta_logo, width=140, height=60)
    else:
        logo = Paragraph("LOGO", styles["Title"])
    
    titulo_central = [
        Paragraph('<font color="#333333"><b>Edupork: Gestion de Alimentacion Porcina</b></font>', styles["Title"]),
        Paragraph('<para align="center"><font color="#333333">Informe de Porcinos registrados</font></para>',styles["Normal"])
    ]

    info_derecha = [
        Paragraph(f'<font color="#333333"><b>CÓDIGO:</b> {codigo}</font>', styles["Normal"]),
        Paragraph('<font color="#333333"><b>VERSIÓN:</b> 1</font>', styles["Normal"]),
    ]

    ruta_logo_sena = os.path.join("src/static/iconos/", "logo_sena.png")

    if os.path.exists(ruta_logo_sena):
        logo_sena = Image(ruta_logo_sena, width=60, height=60)
    else:
        logo_sena = Paragraph("LOGO_SENA", styles["Title"])
    
    tabla_encabezado = Table(
        [
            [logo, titulo_central, info_derecha, logo_sena]
        ],
        colWidths=[120, 270, 100, 80]
    )

    tabla_encabezado.setStyle(TableStyle([
        ("BOX", (0, 0), (-1, -1), 1, "#333333"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("ALIGN", (1, 0), (1, 0), "CENTER"),
        ("LEFTPADDING", (1, 0), (1, 0), 10),
        ("RIGHTPADDING", (2, 0), (2, 0), 10),
    ]))

    elementos.append(tabla_encabezado)
    elementos.append(Spacer(1, 20))


    # ================================================
    #                TABLA DE PORCINOS
    # ================================================
    elementos.append(Paragraph('<font color="#333333"><b>Listado de Porcinos</b></font>', styles["Title"]))
    
    encabezado = ["ID_porcino", "Peso_Inicial", "Peso_Final", "Fecha Nac.", "Sexo", "Raza", "Etapa", "Estado", "Descripcion"]
    tabla_data = [encabezado]

    for p in porcinos:
        tabla_data.append([
            p["id_porcino"],
            p["peso_inicial"],
            p["peso_final"],
            p["fecha_nacimiento"],
            p["sexo"],
            p["raza"],
            p["etapa"],
            p["estado"],
            p["descripcion"],
        ])

    verde_header = colors.HexColor("#62804B")
    verde_fila = colors.HexColor("#E7F6DD")

    tabla = Table(tabla_data)

    # AUTO-AJUSTE DE COLUMNAS
    tabla._argW = [None] * len(tabla_data[0])

    # ================================
    #    ESTILOS BASE DE LA TABLA
    # ================================
    estilos_tabla = [
        ("BACKGROUND", (0, 0), (-1, 0), verde_header),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor('#ffffff')),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 12),

        ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#9BC38A")),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#AACF96")),

        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),

        ("FONTSIZE", (0, 1), (-1, -1), 10),
    ]

    # ======================================
    #      ALTERNAR TODAS LAS FILAS
    # ======================================
    for i in range(1, len(tabla_data)):
        if i % 2 == 1:
            estilos_tabla.append(("BACKGROUND", (0, i), (-1, i), verde_fila))

    tabla.setStyle(TableStyle(estilos_tabla))

    elementos.append(tabla)

    # ================================================
    #                GENERAR PDF
    # ================================================
    pdf.build(elementos)

    pdf_value = buffer.getvalue()
    buffer.close()

    response = make_response(pdf_value)
    response.headers["Content-Type"] = "application/pdf"
    response.headers["Content-Disposition"] = 'inline; filename="reporte_porcinos.pdf"'

    return response

  except Exception as err:
    print(err)
    return jsonify({'Mensaje': 'Error al generar el pdf'})


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
        id_raza = cur.lastrowid
        cur.execute(f"""
                      INSERT INTO notificaciones (id_usuario_destinatario, id_usuario_origen, titulo, mensaje, tipo)
                      VALUES (3, 3, 'Registro de Raza',
                      CONCAT('Se registró una nueva raza con ID {id_raza}'),'Ingreso');
                      """)
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
        cur.execute(f"""
                      INSERT INTO notificaciones (id_usuario_destinatario, id_usuario_origen, titulo, mensaje, tipo)
                      VALUES (3, 3, 'Actualizacion de la información de la Raza',
                      CONCAT('Se actualizo la información de la raza con ID {id}'),'Actualización');
                      """)
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
        cur.execute(f"""
                      INSERT INTO notificaciones (id_usuario_destinatario, id_usuario_origen, titulo, mensaje, tipo)
                      VALUES (3, 3, 'Eliminación de la información de la Raza',
                      CONCAT('Se eliminó la información de la raza con ID {id}'),'Eliminación');
                      """)
        conn.commit()

    return jsonify({'Mensaje': 'Raza eliminada correctamente'})
  except Exception as err:
    print(err)
    return jsonify({'Mensaje':'Error en la base de datos'})


#Ruta para generar PDF del listado de porcinos
@app.route("/PDF_razas")
def reporte_razas():

  try:
    try:
      with config['development'].conn() as conn:
        with conn.cursor() as cur:
          cur.execute('SELECT * FROM raza')
          razas = cur.fetchall()
    except Exception as err:
      print(err)
      return jsonify({'Error al Consultar las Razas'})

    buffer = io.BytesIO()
    pdf = SimpleDocTemplate(buffer, pagesize=letter, topMargin=40)
    elementos = []
    codigo = random.randint(0,9999)
    styles = getSampleStyleSheet()


    # ================================================
    #               ENCABEZADO PERSONALIZADO
    # ================================================
    ruta_logo = os.path.join("src/static/iconos/", "Logo_edupork.png")

    if os.path.exists(ruta_logo):
        logo = Image(ruta_logo, width=140, height=60)
    else:
        logo = Paragraph("LOGO", styles["Title"])
    
    titulo_central = [
        Paragraph('<font color="#333333"><b>Edupork: Gestion de Alimentacion Porcina</b></font>', styles["Title"]),
        Paragraph('<para align="center"><font color="#333333">Informe de Razas registradas</font></para>',styles["Normal"])
    ]

    info_derecha = [
        Paragraph(f'<font color="#333333"><b>CÓDIGO:</b> {codigo}</font>', styles["Normal"]),
        Paragraph('<font color="#333333"><b>VERSIÓN:</b> 1</font>', styles["Normal"]),
    ]

    ruta_logo_sena = os.path.join("src/static/iconos/", "logo_sena.png")

    if os.path.exists(ruta_logo_sena):
        logo_sena = Image(ruta_logo_sena, width=60, height=60)
    else:
        logo_sena = Paragraph("LOGO_SENA", styles["Title"])
    
    tabla_encabezado = Table(
        [
            [logo, titulo_central, info_derecha, logo_sena]
        ],
        colWidths=[120, 270, 100, 80]
    )

    tabla_encabezado.setStyle(TableStyle([
        ("BOX", (0, 0), (-1, -1), 1, "#333333"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("ALIGN", (1, 0), (1, 0), "CENTER"),
        ("LEFTPADDING", (1, 0), (1, 0), 10),
        ("RIGHTPADDING", (2, 0), (2, 0), 10),
    ]))

    elementos.append(tabla_encabezado)
    elementos.append(Spacer(1, 20))


    # ================================================
    #                TABLA DE RAZAS
    # ================================================
    elementos.append(Paragraph('<font color="#333333"><b>Listado de Razas</b></font>', styles["Title"]))
    
    encabezado = ["ID Raza", "Nombre Raza", "Descripcion"]
    tabla_data = [encabezado]

    for r in razas:
        tabla_data.append([
            r["id_raza"],
            r["nombre"],
            r["descripcion"]
        ])

    verde_header = colors.HexColor("#62804B")
    verde_fila = colors.HexColor("#E7F6DD")

    tabla = Table(tabla_data)

    tabla._argW = [None] * len(tabla_data[0])
    
    # ================================
    #    ESTILOS BASE DE LA TABLA
    # ================================
    estilos_tabla = [
        ("BACKGROUND", (0, 0), (-1, 0), verde_header),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor('#ffffff')),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 12),

        ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#9BC38A")),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#AACF96")),

        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),

        ("FONTSIZE", (0, 1), (-1, -1), 10),
    ]

    # ======================================
    #      ALTERNAR TODAS LAS FILAS
    # ======================================
    for i in range(1, len(tabla_data)):
        if i % 2 == 1:
            estilos_tabla.append(("BACKGROUND", (0, i), (-1, i), verde_fila))

    tabla.setStyle(TableStyle(estilos_tabla))

    elementos.append(tabla)

    # ================================================
    #                GENERAR PDF
    # ================================================
    pdf.build(elementos)

    pdf_value = buffer.getvalue()
    buffer.close()

    response = make_response(pdf_value)
    response.headers["Content-Type"] = "application/pdf"
    response.headers["Content-Disposition"] = 'inline; filename="reporte_razas.pdf"'

    return response

  except Exception as err:
    print(err)
    return jsonify({'Mensaje': 'Error al generar el pdf'})



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
                ev.nombre, 
                ev.peso_min, 
                ev.peso_max, 
                ev.duracion_dias,
                ev.duracion_semanas,
                ev.descripcion,
                e.id_elemento,
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
          "nombre" : fila['nombre'],
          "peso_min" : fila['peso_min'],
          "peso_max" : fila['peso_max'],
          "duracion_dias" : fila['duracion_dias'],
          "duracion_semanas" : fila['duracion_semanas'],
          "descripcion" : fila['descripcion'],
          "requerimientos" : []
        }
      if fila['nombre_elemento']:
        etapas[id_etapa]['requerimientos'].append({
          "id_elemento" : fila['id_elemento'],
          "nombre_elemento" : fila["nombre_elemento"],
          "porcentaje" : fila['porcentaje']
        })
    
    if etapas:
      etapas = list(etapas.values())
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
        cur.execute("""
            SELECT 
                ev.id_etapa, 
                ev.nombre, 
                ev.peso_min, 
                ev.peso_max, 
                ev.duracion_dias,
                ev.duracion_semanas,
                ev.descripcion,
                e.id_elemento,
                e.nombre as nombre_elemento,
                rn.porcentaje
            FROM etapa_vida ev
            LEFT JOIN requerimientos_nutricionales rn ON ev.id_etapa = rn.id_etapa
            LEFT JOIN elementos e ON rn.id_elemento = e.id_elemento
            WHERE ev.id_etapa = %s
            ORDER BY ev.id_etapa
        """,(id,))
    
        filas = cur.fetchall()
    
    etapa = {}
    for fila in filas:
      id_etapa = fila['id_etapa']
      if id_etapa not in etapa:
        etapa[id_etapa] = {
          "id_etapa" : id_etapa,
          "nombre" : fila['nombre'],
          "peso_min" : fila['peso_min'],
          "peso_max" : fila['peso_max'],
          "duracion_dias" : fila['duracion_dias'],
          "duracion_semanas" : fila['duracion_semanas'],
          "descripcion" : fila['descripcion'],
          "requerimientos" : []
        }
        
      if fila['nombre_elemento']:
        etapa[id_etapa]['requerimientos'].append({
          "id_elemento" : fila['id_elemento'],
          "nombre_elemento" : fila["nombre_elemento"],
          "porcentaje" : fila["porcentaje"]
        })
      
    if etapa:
      etapa = list(etapa.values())
      return jsonify({'etapas': etapa, 'Mensaje': 'Etapa de vida consultada'})
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
    nombre_etapa = data['nombre']
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
        
        cur.execute(f"""
                      INSERT INTO notificaciones (id_usuario_destinatario, id_usuario_origen, titulo, mensaje, tipo)
                      VALUES (3, 3, 'Registro de Etapa de vida',
                      CONCAT('Se registró una nueva etapa de vida con ID {id_etapa}'),'Ingreso');
                      """)
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
    nombre_etapa = data['nombre']
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
        cur.execute(f"""
                      INSERT INTO notificaciones (id_usuario_destinatario, id_usuario_origen, titulo, mensaje, tipo)
                      VALUES (3, 3, 'Actualizacion de la información de la Etapa de Vida',
                      CONCAT('Se actualizo la información de la etapa de vida con ID {id}'),'Actualización');
                      """)
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
        cur.execute("""
                    DELETE FROM requerimientos_nutricionales
                    WHERE id_etapa = %s
                    """, (id))
        cur.execute("""
                    DELETE FROM etapa_vida 
                    WHERE id_etapa = %s
                    """,
                    (id))
        cur.execute(f"""
                      INSERT INTO notificaciones (id_usuario_destinatario, id_usuario_origen, titulo, mensaje, tipo)
                      VALUES (3, 3, 'Eliminación de la información de la Etapa de Vida',
                      CONCAT('Se eliminó la información de la etapa de vida con ID {id}'),'Eliminación');
                      """)
        conn.commit()
    return jsonify({'Mensaje': 'Etapa de vida eliminada correctamente'})
  except Exception as err:
    print(err)
    return jsonify({'Mensaje':'Error en la base de datos'})


#Ruta para generar PDF del listado de etapas
@app.route("/PDF_etapas")
def reporte_etapas():

    try:
        # ================================================
        #            CONSULTA A LA BASE DE DATOS
        # ================================================
        with config['development'].conn() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT 
                        ev.id_etapa, 
                        ev.nombre, 
                        ev.peso_min, 
                        ev.peso_max, 
                        ev.duracion_dias,
                        ev.duracion_semanas,
                        ev.descripcion,
                        e.id_elemento,
                        e.nombre as nombre_elemento,
                        rn.porcentaje
                    FROM etapa_vida ev
                    LEFT JOIN requerimientos_nutricionales rn ON ev.id_etapa = rn.id_etapa
                    LEFT JOIN elementos e ON rn.id_elemento = e.id_elemento
                    ORDER BY ev.id_etapa;
                """)
                filas = cur.fetchall()

        # Organizar datos por etapa
        etapas_dic = {}
        for fila in filas:
            id_etapa = fila["id_etapa"]

            if id_etapa not in etapas_dic:
                etapas_dic[id_etapa] = {
                    "id_etapa": id_etapa,
                    "nombre": fila["nombre"],
                    "peso_min": fila["peso_min"],
                    "peso_max": fila["peso_max"],
                    "duracion_dias": fila["duracion_dias"],
                    "duracion_semanas": fila["duracion_semanas"],
                    "descripcion": fila["descripcion"],
                    "requerimientos": []
                }

            if fila["nombre_elemento"]:
                etapas_dic[id_etapa]["requerimientos"].append({
                    "nombre_elemento": fila["nombre_elemento"],
                    "porcentaje": fila["porcentaje"]
                })

        etapas = list(etapas_dic.values())

        # ================================================
        #                  CREAR PDF
        # ================================================
        buffer = io.BytesIO()
        pdf = SimpleDocTemplate(buffer, pagesize=landscape(letter))
        elementos = []
        styles = getSampleStyleSheet()
        codigo = random.randint(1000, 9999)

        # ================================================
        #               ENCABEZADO PERSONALIZADO
        # ================================================
        ruta_logo = os.path.join("src/static/iconos/", "Logo_edupork.png")
        logo = Image(ruta_logo, width=140, height=60) if os.path.exists(ruta_logo) else Paragraph("LOGO", styles["Title"])

        ruta_logo_sena = os.path.join("src/static/iconos/", "logo_sena.png")
        logo_sena = Image(ruta_logo_sena, width=60, height=60) if os.path.exists(ruta_logo_sena) else Paragraph("SENA", styles["Title"])

        titulo_central = [
            Paragraph('<para align="center"><b>Edupork: Gestion de Alimentacion Porcina</b></para>', styles["Title"]),
            Paragraph('<para align="center">Informe de Etapas de Vida Registradas</para>', styles["Normal"])
        ]

        info_derecha = [
            Paragraph(f'<b>CÓDIGO:</b> {codigo}', styles["Normal"]),
            Paragraph('<b>VERSIÓN:</b> 1', styles["Normal"]),
        ]

        tabla_encabezado = Table(
            [[logo, titulo_central, info_derecha, logo_sena]],
            colWidths=[120, 300, 120, 80]
        )

        tabla_encabezado.setStyle(TableStyle([
            ("BOX", (0, 0), (-1, -1), 1, colors.black),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("ALIGN", (1, 0), (1, 0), "CENTER"),
        ]))

        elementos.append(tabla_encabezado)
        elementos.append(Spacer(1, 20))

        # ================================================
        #                   TABLA PRINCIPAL
        # ================================================
        elementos.append(Paragraph('<b>Listado de Etapas de Vida</b>', styles["Title"]))
        elementos.append(Spacer(1, 10))

        encabezado = [
            "ID", "Nombre", "Peso Min.", "Peso Max.",
            "Duración (días)", "Duración (semanas)",
            "Descripción", "Requerimientos Nutricionales"
        ]

        tabla_data = [encabezado]

        for e in etapas:

            # Convertir los requerimientos en texto dentro de una celda
            req_text = "<br/>".join([
                f"{req['nombre_elemento']}: {req['porcentaje']}%"
                for req in e["requerimientos"]
            ]) if e["requerimientos"] else "Sin registros"

            tabla_data.append([
                e["id_etapa"],
                e["nombre"],
                e["peso_min"],
                e["peso_max"],
                e["duracion_dias"],
                e["duracion_semanas"],
                e["descripcion"],
                Paragraph(req_text, styles["Normal"])
            ])

        # ================================================
        #               ESTILOS DE LA TABLA
        # ================================================
        verde_header = colors.HexColor("#62804B")
        verde_fila = colors.HexColor("#E7F6DD")

        tabla = Table(tabla_data)
        tabla._argW = [None] * len(tabla_data[0])

        estilos = [
            ("BACKGROUND", (0, 0), (-1, 0), verde_header),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, 0), 11),

            ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#9BC38A")),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#AACF96")),

            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ]

        # Alternar filas pastel
        for i in range(1, len(tabla_data)):
            if i % 2 == 1:
                estilos.append(("BACKGROUND", (0, i), (-1, i), verde_fila))

        tabla.setStyle(TableStyle(estilos))
        elementos.append(tabla)

        # ================================================
        #                   EXPORTAR PDF
        # ================================================
        pdf.build(elementos)

        pdf_value = buffer.getvalue()
        buffer.close()

        response = make_response(pdf_value)
        response.headers["Content-Type"] = "application/pdf"
        response.headers["Content-Disposition"] = 'inline; filename="reporte_etapas.pdf"'

        return response

    except Exception as err:
        print(err)
        return jsonify({"Mensaje": "Error al generar PDF"})


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


@app.route("/ultima_notificacion/<int:id>", methods=['GET'])
def ultima_notificacion_usuario(id):
    """
    Obtiene la última notificación de un usuario
    ---
    tags:
      - Notificaciones
    responses:
      200:
        description: Última notificación de un usuario
    """
    try:
        with config['development'].conn() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT id_notificacion, titulo, mensaje, tipo, fecha_creacion
                    FROM notificaciones 
                    WHERE id_usuario_destinatario = %s
                    ORDER BY fecha_creacion DESC
                    LIMIT 1
                """, (id,))  
                info = cursor.fetchone()  

        if info:
            if hasattr(info['fecha_creacion'], 'strftime'):
                info['fecha_creacion'] = info['fecha_creacion'].strftime('%Y-%m-%d %H:%M:%S')

            return jsonify({
                'Mensaje': 'Última notificación',
                'Notificacion': info
            })
        else:
            return jsonify({'Mensaje': 'No hay notificaciones'})

    except Exception as err:
        print("Error en /ultima_notificacion/<id>:", err)
        return jsonify({'Mensaje': 'Error', 'Detalle': str(err)})

# ----------------------------
# SECCION GESTIONAR ALIMENTOS
# ----------------------------

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

@app.route("/PDF_alimentos")
def reporte_alimentos():
    try:
        # ================================
        #      CONSULTA BASE DE DATOS
        # ================================
        try:
            with config['development'].conn() as conn:
                with conn.cursor() as cur:
                    cur.execute("""
                        SELECT 
                            id_alimento,
                            nombre,
                            estado
                        FROM alimentos
                        ORDER BY id_alimento ASC
                    """)
                    alimentos = cur.fetchall()
        except Exception as err:
            print(err)
            return jsonify({'Error': 'Error al consultar los alimentos'})

        if not alimentos:
            return jsonify({"mensaje": "No encontrado"})

        # ================================
        #      CREAR PDF
        # ================================
        buffer = io.BytesIO()
        pdf = SimpleDocTemplate(buffer, pagesize=landscape(letter))
        elementos = []
        styles = getSampleStyleSheet()
        codigo = random.randint(0, 9999)

        # ================================================
        #               ENCABEZADO PERSONALIZADO
        # ================================================
        ruta_logo = os.path.join("src/static/iconos/", "Logo_edupork.png")
        logo = Image(ruta_logo, width=140, height=60) if os.path.exists(ruta_logo) else Paragraph("LOGO", styles["Title"])
        
        titulo_central = [
            Paragraph('<font color="#333333"><b>Edupork: Alimentación Porcina</b></font>', styles["Title"]),
            Paragraph('<para align="center"><font color="#333333">Informe de Alimentos Registrados</font></para>', styles["Normal"])
        ]

        info_derecha = [
            Paragraph(f'<font color="#333333"><b>CÓDIGO:</b> {codigo}</font>', styles["Normal"]),
            Paragraph('<font color="#333333"><b>VERSIÓN:</b> 1</font>', styles["Normal"]),
        ]

        ruta_logo_sena = os.path.join("src/static/iconos/", "logo_sena.png")
        logo_sena = Image(ruta_logo_sena, width=60, height=60) if os.path.exists(ruta_logo_sena) else Paragraph("LOGO_SENA", styles["Title"])

        tabla_encabezado = Table(
            [[logo, titulo_central, info_derecha, logo_sena]],
            colWidths=[120, 300, 120, 80]  # Más ancho en el título y código
        )
        tabla_encabezado.setStyle(TableStyle([
            ("BOX", (0, 0), (-1, -1), 1, "#333333"),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("ALIGN", (1, 0), (1, 0), "CENTER"),
            ("LEFTPADDING", (1, 0), (1, 0), 10),
            ("RIGHTPADDING", (2, 0), (2, 0), 10),
        ]))

        elementos.append(tabla_encabezado)
        elementos.append(Spacer(1, 20))

        # ================================================
        #                TABLA DE ALIMENTOS
        # ================================================
        elementos.append(Paragraph('<font color="#333333"><b>Listado de Alimentos</b></font>', styles["Title"]))

        encabezado = ["ID", "Nombre", "Estado"]
        tabla_data = [encabezado]

        for a in alimentos:
            tabla_data.append([a["id_alimento"], a["nombre"], a["estado"]])

        verde_header = colors.HexColor("#62804B")
        verde_fila = colors.HexColor("#E7F6DD")

        tabla = Table(tabla_data)

        # ANCHO PROPORCIONAL DE COLUMNAS
        tabla._argW = [60, 400, 120]  # ID más pequeño, Nombre más ancho, Estado intermedio

        # ================================
        #    ESTILOS BASE DE LA TABLA
        # ================================
        estilos_tabla = [
            ("BACKGROUND", (0, 0), (-1, 0), verde_header),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, 0), 12),

            ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#9BC38A")),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#AACF96")),

            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),

            ("FONTSIZE", (0, 1), (-1, -1), 10),
        ]

        # ALTERNAR FILAS
        for i in range(1, len(tabla_data)):
            if i % 2 == 1:
                estilos_tabla.append(("BACKGROUND", (0, i), (-1, i), verde_fila))

        tabla.setStyle(TableStyle(estilos_tabla))
        elementos.append(tabla)

        # ================================================
        #                GENERAR PDF
        # ================================================
        pdf.build(elementos)

        pdf_value = buffer.getvalue()
        buffer.close()

        response = make_response(pdf_value)
        response.headers["Content-Type"] = "application/pdf"
        response.headers["Content-Disposition"] = 'inline; filename="reporte_alimentos.pdf"'

        return response

    except Exception as err:
        print(err)
        return jsonify({'Mensaje': 'Error al generar el PDF'})

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

        # Guardar imagen si existe
        imagen_web = None
        if imagen_file and imagen_file.filename != "":
            try:
                filename = secure_filename(imagen_file.filename)
                ruta = os.path.join(app.config["cargar_imagenes"], filename)
                imagen_file.save(ruta)
                imagen_web = f"/static/imagenes_base_de_datos/{filename}"
            except Exception as e:
                print("Error al guardar imagen:", e)
                return jsonify({"error": "No se pudo guardar la imagen."}), 500

        id_usuario = 3  # Cambiar según login real

        with config['development'].conn() as conn:
            with conn.cursor() as cur:
                try:
                    # Insertar alimento
                    cur.execute("""
                        INSERT INTO alimentos(nombre, estado, imagen, id_usuario)
                        VALUES (%s, %s, %s, %s)
                    """, (nombre, "Activo", imagen_web, id_usuario))
                    id_alimento = cur.lastrowid

                    # Insertar elementos si existen
                    if elementos:
                        elementos = json.loads(elementos)
                        for elem in elementos:
                            cur.execute("""
                                INSERT INTO alimento_tiene_elemento (id_alimento, id_elemento, valor)
                                VALUES (%s, %s, %s)
                            """, (id_alimento, elem["id"], elem["valor"]))

                    # Crear notificaciones para todos los usuarios
                    cur.execute("SELECT id_usuario FROM usuario")
                    usuarios = cur.fetchall()
                    for u in usuarios:
                        cur.execute("""
                            INSERT INTO notificaciones (id_usuario_destinatario, id_usuario_origen, titulo, mensaje, tipo)
                            VALUES (%s, %s, %s, %s, %s)
                        """, (u['id_usuario'], id_usuario, 'Nuevo alimento creado',
                              f'Se registró el alimento "{nombre}" con ID {id_alimento}', 'Ingreso'))

                    conn.commit()

                except Exception as db_err:
                    # Error de clave duplicada
                    if hasattr(db_err, 'args') and db_err.args[0] == 1062:
                        return jsonify({"error": f'El nombre "{nombre}" ya está registrado.'}), 400
                    else:
                        print("Error DB:", db_err)
                        return jsonify({"error": "Error en el servidor, intente nuevamente."}), 500

        # Respuesta final para JS
        return jsonify({
            "exito": True,
            "mensaje": f'Alimento "{nombre}" creado correctamente',
            "id_alimento": id_alimento,
            "imagen": imagen_web
        })

    except Exception as e:
        print("Error registrar_alimento:", e)
        return jsonify({"error": "Error en el servidor, intente nuevamente."}), 500

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

@app.route("/actualizar_alimento/<int:id_alimento>", methods=["PUT", "POST"])
def actualizar_alimento(id_alimento):
    try:
        # Detectar si es multipart/form-data o JSON
        if request.content_type.startswith("multipart/form-data"):
            nombre_nuevo = request.form.get("nombre")
            estado = request.form.get("estado", "Activo")
            elementos = json.loads(request.form.get("elementos", "[]"))
            imagen_file = request.files.get("imagen")
        else:
            data = request.get_json()
            nombre_nuevo = data.get("nombre")
            estado = data.get("estado", "Activo")
            elementos = data.get("elementos", [])
            imagen_file = None

        if not nombre_nuevo:
            return jsonify({"error": "El nombre del alimento es obligatorio."}), 400

        # Guardar imagen si se envía
        imagen_web = None
        if imagen_file and imagen_file.filename != "":
            filename = secure_filename(imagen_file.filename)
            ruta = os.path.join(app.config["cargar_imagenes"], filename)
            imagen_file.save(ruta)
            imagen_web = f"/static/imagenes_base_de_datos/{filename}"

        with config['development'].conn() as conn:
            with conn.cursor() as cur:
                # Obtener nombre y estado viejo
                cur.execute("SELECT nombre, estado FROM alimentos WHERE id_alimento=%s", (id_alimento,))
                fila = cur.fetchone()
                if not fila:
                    return jsonify({"error": "El alimento no existe."}), 404
                nombre_viejo = fila["nombre"]
                estado_viejo = fila["estado"]

                # Verificar si el nombre nuevo ya existe en otro registro
                cur.execute("SELECT id_alimento FROM alimentos WHERE nombre=%s AND id_alimento!=%s", 
                            (nombre_nuevo, id_alimento))
                if cur.fetchone():
                    return jsonify({"error": f"El nombre '{nombre_nuevo}' ya está en uso."}), 400

                # Actualizar alimento
                if imagen_web:
                    cur.execute("""
                        UPDATE alimentos 
                        SET nombre=%s, estado=%s, imagen=%s 
                        WHERE id_alimento=%s
                    """, (nombre_nuevo, estado, imagen_web, id_alimento))
                else:
                    cur.execute("""
                        UPDATE alimentos 
                        SET nombre=%s, estado=%s
                        WHERE id_alimento=%s
                    """, (nombre_nuevo, estado, id_alimento))

                # Actualizar elementos
                for elem in elementos:
                    cur.execute("""
                        INSERT INTO alimento_tiene_elemento (id_alimento, id_elemento, valor)
                        VALUES (%s, %s, %s)
                        ON DUPLICATE KEY UPDATE valor=VALUES(valor)
                    """, (id_alimento, elem["id_elemento"], elem["valor"]))

                # Crear mensaje según el cambio
                if nombre_nuevo != nombre_viejo:
                    mensaje = f'El alimento "{nombre_viejo}" fue actualizado y ahora se llama "{nombre_nuevo}".'
                elif estado.lower() != estado_viejo.lower():
                    if estado.lower() == "inactivo":
                        mensaje = f'El alimento "{nombre_nuevo}" fue desactivado.'
                    else:
                        mensaje = f'El alimento "{nombre_nuevo}" fue activado.'
                else:
                    mensaje = f'El alimento "{nombre_nuevo}" fue actualizado correctamente.'

                # Crear notificaciones para todos los usuarios
                cur.execute("SELECT id_usuario FROM usuario")
                usuarios = cur.fetchall()
                for u in usuarios:
                    cur.execute("""
                        INSERT INTO notificaciones (id_usuario_destinatario, id_usuario_origen, titulo, mensaje, tipo)
                        VALUES (%s, %s, %s, %s, %s)
                    """, (
                        u['id_usuario'],
                        3,  # usuario que realizó la acción
                        "Alimento actualizado",
                        mensaje,
                        "Actualización"
                    ))

                conn.commit()

        return jsonify({
            "mensaje": "Alimento actualizado correctamente",
            "imagen": imagen_web
        }), 200

    except Exception as e:
        print("Error en actualización:", e)
        return jsonify({"error": "Ocurrió un error en el servidor. Intente nuevamente."}), 500

@app.route("/eliminar_alimento/<int:id>", methods=["DELETE"])
def eliminar_alimento(id):
    try:
        with config['development'].conn() as conn:
            with conn.cursor() as cur:
                # Consultar si existe el alimento
                cur.execute("SELECT nombre FROM alimentos WHERE id_alimento = %s", (id,))
                alimento = cur.fetchone()
                if not alimento:
                    return jsonify({"error": "El alimento no existe."}), 404

                nombre_alimento = alimento['nombre']

                try:
                    cur.execute("DELETE FROM alimento_tiene_elemento WHERE id_alimento = %s", (id,))
                    cur.execute("DELETE FROM alimentos WHERE id_alimento = %s", (id,))
                    
                    cur.execute("SELECT id_usuario FROM usuario")
                    usuarios = cur.fetchall()
                    for u in usuarios:
                        cur.execute("""
                            INSERT INTO notificaciones 
                            (id_usuario_destinatario, id_usuario_origen, titulo, mensaje, tipo)
                            VALUES (%s, %s, %s, %s, %s)
                        """, (u['id_usuario'], 3, 'Alimento eliminado',
                              f'Se eliminó el alimento "{nombre_alimento}"', 'Eliminación'))

                    conn.commit()

                    return jsonify({"mensaje": f"Alimento '{nombre_alimento}' eliminado correctamente"})

                except Exception as fk_err:
                    # Error de integridad referencial
                    if hasattr(fk_err, 'args') and fk_err.args[0] == 1451:
                        return jsonify({
                            "error": f"No se puede eliminar '{nombre_alimento}' porque está asociado a dietas. Puede desactivarlo en su lugar."
                        }), 400
                    else:
                        return jsonify({"error": "Error en el servidor, intente nuevamente."}), 500

    except Exception as e:
        return jsonify({"error": "Error en el servidor, intente nuevamente."}), 500

# -----------------------------------
# DIETAS
# ----------------------------------
@app.route("/mezcla_nutricional", methods=["POST"])
def mezcla_nutricional():
    """
    Calcula la mezcla nutricional de varios alimentos según sus kg
    ---
    tags:
      - Mezcla Nutricional
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            properties:
              alimentos:
                type: array
                items:
                  type: object
                  properties:
                    id_alimento:
                      type: integer
                    kg:
                      type: number
    responses:
      200:
        description: Composición nutricional de la mezcla
    """
    try:
        datos = request.get_json()
        alimentos_input = datos.get("alimentos", [])

        if not alimentos_input:
            return jsonify({"error": "No se recibieron alimentos"}), 400

        total_kg = sum(a["kg"] for a in alimentos_input)
        if total_kg <= 0:
            return jsonify({"error": "El total de kg debe ser mayor que 0"}), 400

        nutrientes = ["MS","EM-C","PC","FC","EE","CAL","F.DIS","SOD","ARG","LIS","MET","M+CIS","TREO","TRIP"]

        nombre_bd_a_clave = {
            "proteina_cruda": "PC",
            "fosforo": "F.DIS",
            "treonina": "TREO",
            "fibra_cruda": "FC",
            "sodio": "SOD",
            "metionina": "MET",
            "materia_seca": "MS",
            "extracto_etereo": "EE",
            "arginina": "ARG",
            "metionina_cisteina": "M+CIS",
            "energia_metabo": "EM-C",
            "calcio": "CAL",
            "lisina": "LIS",
            "triptofano": "TRIP"
        }

        mezcla = {nutriente: 0 for nutriente in nutrientes}
        porcentajes = []

        with config['development'].conn() as conn:
            with conn.cursor() as cur:
                for a in alimentos_input:
                    cur.execute("""
                        SELECT e.nombre AS nombre_elemento, ate.valor
                        FROM alimento_tiene_elemento ate
                        JOIN elementos e ON e.id_elemento = ate.id_elemento
                        WHERE ate.id_alimento = %s
                    """, (a["id_alimento"],))
                    elementos = cur.fetchall()

                    nutr_alimento = {}
                    for n in elementos:
                        nombre_lower = n["nombre_elemento"].lower()  # pasar a minúsculas
                        clave = nombre_bd_a_clave.get(nombre_lower)
                        if clave:
                            nutr_alimento[clave] = float(n["valor"])

                    for nutriente in nutrientes:
                        mezcla[nutriente] += nutr_alimento.get(nutriente, 0) * a["kg"]

                    porcentajes.append({
                        "id_alimento": a["id_alimento"],
                        "porcentaje": round(a["kg"] * 100 / total_kg, 2)
                    })

        for nutriente in mezcla:
            mezcla[nutriente] = round(mezcla[nutriente] / total_kg, 2)

        return jsonify({
            "mezcla_nutricional": mezcla,
            "porcentajes_alimentos": porcentajes
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/crear_dieta", methods=["POST"])
def crear_dieta():
    try:
        data = request.get_json()
        id_usuario = data.get("id_usuario")
        id_etapa_vida = data.get("id_etapa_vida")
        descripcion = data.get("descripcion")
        alimentos = data.get("alimentos", [])  # [{id_alimento, cantidad}]

        if not id_usuario or not id_etapa_vida:
            return jsonify({"error": "Faltan datos obligatorios"}), 400

        if not alimentos:
            return jsonify({"error": "No hay alimentos para la dieta"}), 400

        nutrientes = ["MS","EM-C","PC","FC","EE","CAL","F.DIS","SOD","ARG","LIS","MET","M+CIS","TREO","TRIP"]
        nombre_bd_a_clave = {
            "proteina_cruda": "PC",
            "fosforo": "F.DIS",
            "treonina": "TREO",
            "fibra_cruda": "FC",
            "sodio": "SOD",
            "metionina": "MET",
            "materia_seca": "MS",
            "extracto_etereo": "EE",
            "arginina": "ARG",
            "metionina_cisteina": "M+CIS",
            "energia_metabo": "EM-C",
            "calcio": "CAL",
            "lisina": "LIS",
            "triptofano": "TRIP"
        }

        total_kg = sum(a["cantidad"] for a in alimentos)
        if total_kg <= 0:
            return jsonify({"error": "La cantidad total debe ser mayor a 0"}), 400

        mezcla = {nutriente: 0 for nutriente in nutrientes}

        with config['development'].conn() as conn:
            with conn.cursor() as cur:
                # Obtener nombre de la etapa de vida
                cur.execute("""
                    SELECT nombre
                    FROM etapa_vida
                    WHERE id_etapa = %s
                """, (id_etapa_vida,))
                etapa = cur.fetchone()
                nombre_etapa = etapa["nombre"] if etapa else "Desconocida"

                # Calcular mezcla nutricional
                for a in alimentos:
                    cur.execute("""
                        SELECT e.nombre AS nombre_elemento, ate.valor
                        FROM alimento_tiene_elemento ate
                        JOIN elementos e ON e.id_elemento = ate.id_elemento
                        WHERE ate.id_alimento = %s
                    """, (a["id_alimento"],))
                    elementos = cur.fetchall()

                    nutr_alimento = {}
                    for n in elementos:
                        clave = nombre_bd_a_clave.get(n["nombre_elemento"].lower())
                        if clave:
                            nutr_alimento[clave] = float(n["valor"])

                    for nutriente in nutrientes:
                        mezcla[nutriente] += nutr_alimento.get(nutriente, 0) * a["cantidad"]

                # calcular promedio según total_kg
                for nutriente in mezcla:
                    mezcla[nutriente] = round(mezcla[nutriente] / total_kg, 2)

                # insertar dieta con mezcla nutricional
                cur.execute("""
                    INSERT INTO dietas (id_usuario, id_etapa_vida, fecha_creacion, descripcion, mezcla_nutricional)
                    VALUES (%s, %s, CURDATE(), %s, %s)
                """, (id_usuario, id_etapa_vida, descripcion, json.dumps(mezcla)))

                id_dieta = cur.lastrowid

                # insertar alimentos
                for item in alimentos:
                    cur.execute("""
                        INSERT INTO dieta_tiene_alimentos (id_dieta, id_alimento, cantidad)
                        VALUES (%s, %s, %s)
                    """, (id_dieta, item["id_alimento"], item["cantidad"]))

                # Crear notificación para todos los usuarios
                cur.execute("SELECT id_usuario FROM usuario")
                usuarios = cur.fetchall()
                for u in usuarios:
                    cur.execute("""
                        INSERT INTO notificaciones (id_usuario_destinatario, id_usuario_origen, titulo, mensaje, tipo)
                        VALUES (%s, %s, %s, %s, %s)
                    """, (
                        u["id_usuario"],
                        id_usuario,
                        "Nueva dieta creada",
                        f'Se creó la dieta con ID {id_dieta} para la etapa "{nombre_etapa}"',
                        "Ingreso"
                    ))

                conn.commit()

        return jsonify({
            "mensaje": "Dieta creada correctamente",
            "id_dieta": id_dieta,
            "nombre_etapa": nombre_etapa,
            "mezcla_nutricional": mezcla
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/dieta", methods=["GET"])
def consultar_dietas():
    try:
        with config['development'].conn() as conn:
            with conn.cursor() as cur:
                # Obtener todas las dietas incluyendo la mezcla nutricional
                cur.execute("""
                    SELECT d.id_dieta,
                           u.nombre AS usuario,
                           d.id_etapa_vida,
                           ev.nombre AS etapa_vida,
                           d.fecha_creacion,
                           d.estado,
                           d.descripcion,
                           d.mezcla_nutricional
                    FROM dietas d
                    JOIN usuario u ON u.id_usuario = d.id_usuario
                    JOIN etapa_vida ev ON ev.id_etapa = d.id_etapa_vida
                """)
                dietas = cur.fetchall()

                resultado = []

                for d in dietas:
                    # Obtener los alimentos de la dieta
                    cur.execute("""
                        SELECT a.id_alimento, a.nombre, da.cantidad
                        FROM dieta_tiene_alimentos da
                        JOIN alimentos a ON a.id_alimento = da.id_alimento
                        WHERE da.id_dieta = %s
                    """, (d["id_dieta"],))
                    alimentos = cur.fetchall()

                    # Calcular el total de kg de la dieta
                    total_kg = sum(a["cantidad"] for a in alimentos) if alimentos else 0

                    # Agregar el porcentaje de cada alimento
                    alimentos_con_porcentaje = []
                    for a in alimentos:
                        porcentaje = round(a["cantidad"] * 100 / total_kg, 2) if total_kg > 0 else 0
                        alimentos_con_porcentaje.append({
                            "id_alimento": a["id_alimento"],
                            "nombre": a["nombre"],
                            "cantidad": a["cantidad"],
                            "porcentaje": porcentaje
                        })

                    # Mezcla nutricional (convertir string JSON a dict si es necesario)
                    mezcla_nutricional = {}
                    if d.get("mezcla_nutricional"):
                        try:
                            import json
                            mezcla_nutricional = json.loads(d["mezcla_nutricional"])
                        except:
                            mezcla_nutricional = d["mezcla_nutricional"]  # si ya viene como dict

                    resultado.append({
                        "id_dieta": d["id_dieta"],
                        "usuario": d["usuario"],
                        "id_etapa_vida": d["id_etapa_vida"],
                        "etapa_vida": d["etapa_vida"],
                        "fecha_creacion": str(d["fecha_creacion"]),
                        "estado": d["estado"],
                        "descripcion": d["descripcion"],
                        "alimentos": alimentos_con_porcentaje,
                        "mezcla_nutricional": mezcla_nutricional
                    })

        return jsonify({"mensaje": resultado})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/PDF_dietas")
def reporte_dietas():
    try:
        # ================================
        #      CONSULTA BASE DE DATOS
        # ================================
        try:
            with config['development'].conn() as conn:
                with conn.cursor() as cur:
                    cur.execute("""
                        SELECT 
                            d.id_dieta,
                            u.nombre AS usuario,
                            ev.nombre AS etapa_vida,
                            d.fecha_creacion,
                            d.estado
                        FROM dietas d
                        JOIN usuario u ON u.id_usuario = d.id_usuario
                        JOIN etapa_vida ev ON ev.id_etapa = d.id_etapa_vida
                        ORDER BY d.id_dieta ASC
                    """)
                    dietas = cur.fetchall()
        except Exception as err:
            print(err)
            return jsonify({'Error': 'Error al consultar las dietas'})

        if not dietas:
            return jsonify({"mensaje": "No encontrado"})

        # ================================
        #      CREAR PDF
        # ================================
        buffer = io.BytesIO()
        pdf = SimpleDocTemplate(buffer, pagesize=landscape(letter))
        elementos = []
        styles = getSampleStyleSheet()
        codigo = random.randint(0, 9999)

        # ================================================
        #               ENCABEZADO PERSONALIZADO
        # ================================================
        ruta_logo = os.path.join("src/static/iconos/", "Logo_edupork.png")
        logo = Image(ruta_logo, width=140, height=60) if os.path.exists(ruta_logo) else Paragraph("LOGO", styles["Title"])
        
        titulo_central = [
            Paragraph('<font color="#333333"><b>Edupork: Alimentacion porcina</b></font>', styles["Title"]),
            Paragraph('<para align="center"><font color="#333333">Informe de Dietas Registradas</font></para>', styles["Normal"])
        ]

        info_derecha = [
            Paragraph(f'<font color="#333333"><b>CÓDIGO:</b> {codigo}</font>', styles["Normal"]),
            Paragraph('<font color="#333333"><b>VERSIÓN:</b> 1</font>', styles["Normal"]),
        ]

        ruta_logo_sena = os.path.join("src/static/iconos/", "logo_sena.png")
        logo_sena = Image(ruta_logo_sena, width=60, height=60) if os.path.exists(ruta_logo_sena) else Paragraph("LOGO_SENA", styles["Title"])

        tabla_encabezado = Table(
            [[logo, titulo_central, info_derecha, logo_sena]],
            colWidths=[120, 300, 120, 80]  # Más ancho en el título y código
        )

        tabla_encabezado.setStyle(TableStyle([
            ("BOX", (0, 0), (-1, -1), 1, "#333333"),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("ALIGN", (1, 0), (1, 0), "CENTER"),
            ("LEFTPADDING", (1, 0), (1, 0), 10),
            ("RIGHTPADDING", (2, 0), (2, 0), 10),
        ]))

        elementos.append(tabla_encabezado)
        elementos.append(Spacer(1, 20))

        # ================================================
        #                TABLA DE DIETAS
        # ================================================
        elementos.append(Paragraph('<font color="#333333"><b>Listado de Dietas</b></font>', styles["Title"]))

        encabezado = ["ID", "Usuario Creador", "Etapa de Vida", "Fecha", "Estado"]
        tabla_data = [encabezado]

        for d in dietas:
            tabla_data.append([
                d["id_dieta"],
                d["usuario"],
                d["etapa_vida"],
                str(d["fecha_creacion"]),
                d["estado"]
            ])

        verde_header = colors.HexColor("#62804B")
        verde_fila = colors.HexColor("#E7F6DD")

        tabla = Table(tabla_data)
        # ANCHO PROPORCIONAL COLUMNAS
        tabla._argW = [60, 200, 200, 120, 100]  # Usuario y Etapa más anchos

        estilos_tabla = [
            ("BACKGROUND", (0, 0), (-1, 0), verde_header),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, 0), 12),

            ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#9BC38A")),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#AACF96")),

            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),

            ("FONTSIZE", (0, 1), (-1, -1), 10),
        ]

        # Alternar fondo
        for i in range(1, len(tabla_data)):
            if i % 2 == 1:
                estilos_tabla.append(("BACKGROUND", (0, i), (-1, i), verde_fila))

        tabla.setStyle(TableStyle(estilos_tabla))
        elementos.append(tabla)

        # ================================================
        #                GENERAR PDF
        # ================================================
        pdf.build(elementos)

        pdf_value = buffer.getvalue()
        buffer.close()

        response = make_response(pdf_value)
        response.headers["Content-Type"] = "application/pdf"
        response.headers["Content-Disposition"] = 'inline; filename="reporte_dietas.pdf"'

        return response

    except Exception as err:
        print(err)
        return jsonify({'Mensaje': 'Error al generar el PDF'})

@app.route("/dieta/<int:id_dieta>", methods=["GET"])
def obtener_dieta(id_dieta):
    try:
        with config['development'].conn() as conn:
            with conn.cursor() as cur:

                # Datos generales de la dieta ----------------------------------
                cur.execute("""
                    SELECT 
                        d.id_dieta,
                        u.nombre AS usuario,
                        d.fecha_creacion,
                        d.estado,
                        d.descripcion,
                        d.mezcla_nutricional,
                        ev.nombre AS etapa_vida
                    FROM dietas d
                    JOIN etapa_vida ev ON d.id_etapa_vida = ev.id_etapa
                    JOIN usuario u ON d.id_usuario = u.id_usuario
                    WHERE d.id_dieta = %s
                """, (id_dieta,))
                dieta = cur.fetchone()

                if not dieta:
                    return jsonify({"mensaje": None})

                # Convertir fecha a formato "yy-mm-dd" --------------------------
                dieta["fecha_creacion"] = dieta["fecha_creacion"].strftime("%Y-%m-%d")

                # Alimentos asociados ------------------------------------------
                cur.execute("""
                    SELECT 
                        a.id_alimento,
                        a.nombre AS alimento,
                        dta.cantidad,
                        a.imagen
                    FROM dieta_tiene_alimentos dta
                    JOIN alimentos a ON dta.id_alimento = a.id_alimento
                    WHERE dta.id_dieta = %s
                """, (id_dieta,))
                alimentos = cur.fetchall()
                dieta["alimentos"] = alimentos

                # Mezcla nutricional -------------------------------------------
                mezcla_nutricional = {}
                if dieta.get("mezcla_nutricional"):
                    try:
                        import json
                        mezcla_nutricional = json.loads(dieta["mezcla_nutricional"])
                    except:
                        mezcla_nutricional = dieta["mezcla_nutricional"]

                dieta["mezcla_nutricional"] = mezcla_nutricional

        return jsonify({"mensaje": dieta})

    except Exception as e:
        return jsonify({"error": str(e)})

@app.route("/PDF_dieta/<int:id_dieta>")
def PDF_dieta(id_dieta):
    try:
        # ================================
        #      OBTENER DATOS DE LA DIETA
        # ================================
        respuesta = obtener_dieta(id_dieta)
        data = respuesta.get_json()["mensaje"]

        if not data:
            return jsonify({"mensaje": "Dieta no encontrada"})

        # Datos generales
        id_d = data["id_dieta"]
        usuario = data["usuario"]
        fecha = str(data["fecha_creacion"])
        estado = data["estado"]
        etapa = data["etapa_vida"]

        # Alimentos
        alimentos = data["alimentos"]

        # Mezcla nutricional
        mezcla = data["mezcla_nutricional"]

        # ================================
        #           CREAR PDF
        # ================================
        buffer = io.BytesIO()
        pdf = SimpleDocTemplate(buffer, pagesize=landscape(letter))
        elementos = []
        styles = getSampleStyleSheet()
        codigo = random.randint(0,9999)

        # --- ENCABEZADO COMÚN ---
        ruta_logo = os.path.join("src/static/iconos/", "Logo_edupork.png")
        ruta_sena = os.path.join("src/static/iconos/", "logo_sena.png")
        logo = Image(ruta_logo, width=140, height=60) if os.path.exists(ruta_logo) else Paragraph("LOGO", styles["Title"])
        logo_sena = Image(ruta_sena, width=60, height=60) if os.path.exists(ruta_sena) else Paragraph("SENA", styles["Title"])

        # ================================
        # HOJA 1: INFORMACIÓN GENERAL Y ALIMENTOS
        # ================================
        titulo1 = [
            Paragraph("<b>Edupork</b>", styles["Title"]),
            Paragraph(f'<para align="center">Reporte Dieta ID {id_d}</para>', styles["Normal"])
        ]
        info1 = [
            Paragraph(f"<b>CÓDIGO:</b> {codigo}", styles["Normal"]),
            Paragraph("<b>VERSIÓN:</b> 1", styles["Normal"])
        ]
        tabla_head1 = Table([[logo, titulo1, info1, logo_sena]], colWidths=[120, 270, 100, 80])
        tabla_head1.setStyle(TableStyle([
            ("BOX", (0,0), (-1,-1), 1, "#333333"),
            ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
            ("ALIGN", (1,0), (1,0), "CENTER")
        ]))
        elementos.append(tabla_head1)
        elementos.append(Spacer(1, 20))

        # Título de información general
        elementos.append(Paragraph("<b>INFORMACIÓN GENERAL</b>", styles["Title"]))
        elementos.append(Spacer(1, 10))

        # Datos generales con estilo uniforme
        tabla_info = [
            ["ID Dieta", id_d],
            ["Usuario Creador", usuario],
            ["Etapa de Vida", etapa],
            ["Fecha", fecha],
            ["Estado", estado]
        ]
        tabla1 = Table(tabla_info, colWidths=[150, 300])
        tabla1.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#62804B")),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            ('BACKGROUND', (0,1), (-1,-1), colors.HexColor("#E7F6DD")),
            ('TEXTCOLOR', (0,1), (-1,-1), colors.black),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('FONTNAME', (0,1), (-1,-1), 'Helvetica'),
            ('FONTSIZE', (0,0), (-1,-1), 11),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#62804B")),
            ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#AACF96")),
            ('LEFTPADDING', (0,0), (-1,-1), 8),
            ('RIGHTPADDING', (0,0), (-1,-1), 8),
            ('TOPPADDING', (0,0), (-1,-1), 4),
            ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ]))
        elementos.append(tabla1)
        elementos.append(Spacer(1, 20))

        # Tabla de alimentos con totales
        elementos.append(Paragraph("<b>Alimentos de la dieta</b>", styles["Title"]))
        total_cant = sum(a["cantidad"] for a in alimentos)
        tabla_alim = [["ID", "Alimento", "Cantidad(KG)", "Porcentaje"]]
        for a in alimentos:
            porcentaje = (a["cantidad"]/total_cant*100) if total_cant>0 else 0
            tabla_alim.append([a["id_alimento"], a["alimento"], f"{a['cantidad']}", f"{porcentaje:.2f}%"])

        # Fila total con suma de cantidad y 100% de porcentaje
        tabla_alim.append(["", "TOTAL", f"{total_cant:.2f}", "100.00%"])

        tabla2 = Table(tabla_alim, colWidths=[60,200,100,100])
        tabla2.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#62804B")),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('BACKGROUND', (0,1), (-1,-2), colors.HexColor("#E7F6DD")),
            ('BACKGROUND', (0,-1), (-1,-1), colors.HexColor("#C0E4B5")),  # color total
            ('TEXTCOLOR', (0,1), (-1,-1), colors.black),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#AACF96")),
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ]))
        elementos.append(tabla2)
        elementos.append(PageBreak())  # Fin hoja 1

        # ================================
        # HOJA 2: MEZCLA NUTRICIONAL
        # ================================
        elementos.append(Paragraph("<b>COMPOSICIÓN NUTRICIONAL</b>", styles["Title"]))
        if mezcla:
            # Diccionario de traducción de abreviaturas a nombres completos
            nombres_nutrientes = {
                "ARG": "ARGININA",
                "CAL": "CALCIO",
                "EE": "EXT. ETEREO",
                "EM-C": "E.M. CERDOS (kcal/kg)",
                "F.DIS": "FOSF. DISP.",
                "FC": "FIBRA CRUDA",
                "LIS": "LISINA",
                "M+CIS": "MET + CIS",
                "MET": "METIONINA",
                "MS": "MATERIA S.",
                "PC": "PROTEÍNA C.",
                "SOD": "SODIO",
                "TREO": "TREONINA",
                "TRIP": "TRIPTOFANO"
            }

            tabla_mezcla = [["Nutriente", "Valor"]]
            for abrev, nombre in nombres_nutrientes.items():
                valor = mezcla.get(abrev, "-")
                # Para EM-C se muestra kcal/kg, resto %
                if abrev != "EM-C" and valor != "-":
                    valor = f"{valor}%" 
                tabla_mezcla.append([nombre, str(valor)])

            tabla3 = Table(tabla_mezcla, colWidths=[200,200])
            tabla3.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#62804B")),
                ('TEXTCOLOR', (0,0), (-1,0), colors.white),
                ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
                ('BACKGROUND', (0,1), (-1,-1), colors.HexColor("#E7F6DD")),
                ('TEXTCOLOR', (0,1), (-1,-1), colors.black),
                ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#AACF96")),
                ('ALIGN', (0,0), (-1,-1), 'CENTER'),
                ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ]))
            elementos.append(tabla3)
        else:
            elementos.append(Paragraph("No se registró mezcla nutricional.", styles["Normal"]))
        elementos.append(PageBreak())  # Fin hoja 2

        # ================================
        # HOJA 3: GRÁFICA DE TORTA
        # ================================
        cantidades = [a["cantidad"] for a in alimentos]
        labels = [a["alimento"] for a in alimentos]
        if cantidades:
            import matplotlib.pyplot as plt
            fig, ax = plt.subplots()
            colores = ["#62804B","#E7F6DD","#A1C181","#9BC995","#DDE7B6","#FFC857","#E9724C","#C5283D"]
            ax.pie(cantidades, labels=labels, autopct="%1.1f%%", colors=colores[:len(cantidades)])
            ax.set_title("Distribución de alimentos (%)")

            img_buf = io.BytesIO()
            plt.savefig(img_buf, format='png', dpi=100, bbox_inches='tight')
            plt.close()
            img_buf.seek(0)

            elementos.append(Image(img_buf, width=450, height=450))

        # --- GENERAR PDF ---
        pdf.build(elementos)
        pdf_value = buffer.getvalue()
        buffer.close()

        response = make_response(pdf_value)
        response.headers["Content-Type"] = "application/pdf"
        response.headers["Content-Disposition"] = f'inline; filename="Dieta_{id_d}.pdf"'
        return response

    except Exception as err:
        print(err)
        return jsonify({'Mensaje': 'Error al generar el PDF'})

@app.route("/actualizar_dieta/<int:id_dieta>", methods=["PUT"])
def actualizar_dieta(id_dieta):
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No se recibieron datos"}), 400

        # Campos obligatorios
        id_etapa_vida = data.get("id_etapa_vida")
        descripcion = data.get("descripcion")
        alimentos = data.get("alimentos", [])
        estado = data.get("estado", "activo")  # por defecto activo

        if estado not in ["Activo", "Inactivo"]:
            return jsonify({"error": "Estado inválido"}), 400

        if not id_etapa_vida or not descripcion:
            return jsonify({"error": "Faltan datos obligatorios"}), 400

        nutrientes = ["MS","EM-C","PC","FC","EE","CAL","F.DIS","SOD","ARG","LIS","MET","M+CIS","TREO","TRIP"]
        nombre_bd_a_clave = {
            "proteina_cruda": "PC",
            "fosforo": "F.DIS",
            "treonina": "TREO",
            "fibra_cruda": "FC",
            "sodio": "SOD",
            "metionina": "MET",
            "materia_seca": "MS",
            "extracto_etereo": "EE",
            "arginina": "ARG",
            "metionina_cisteina": "M+CIS",
            "energia_metabo": "EM-C",
            "calcio": "CAL",
            "lisina": "LIS",
            "triptofano": "TRIP"
        }

        total_kg = sum(a["cantidad"] for a in alimentos)
        if total_kg <= 0:
            return jsonify({"error": "La cantidad total debe ser mayor a 0"}), 400

        mezcla = {nutriente: 0 for nutriente in nutrientes}

        with config['development'].conn() as conn:
            with conn.cursor() as cur:
                # Calcular mezcla nutricional
                for a in alimentos:
                    cur.execute("""
                        SELECT e.nombre AS nombre_elemento, ate.valor
                        FROM alimento_tiene_elemento ate
                        JOIN elementos e ON e.id_elemento = ate.id_elemento
                        WHERE ate.id_alimento = %s
                    """, (a["id_alimento"],))
                    elementos = cur.fetchall()

                    nutr_alimento = {}
                    for n in elementos:
                        clave = nombre_bd_a_clave.get(n["nombre_elemento"].lower())
                        if clave:
                            nutr_alimento[clave] = float(n["valor"])

                    for nutriente in nutrientes:
                        mezcla[nutriente] += nutr_alimento.get(nutriente, 0) * a["cantidad"]

                # calcular promedio según total_kg
                for nutriente in mezcla:
                    mezcla[nutriente] = round(mezcla[nutriente] / total_kg, 2)

                # Actualizar dieta con mezcla nutricional y estado
                cur.execute("""
                    UPDATE dietas 
                    SET id_etapa_vida = %s, descripcion = %s, mezcla_nutricional = %s, estado = %s
                    WHERE id_dieta = %s
                """, (id_etapa_vida, descripcion, json.dumps(mezcla), estado, id_dieta))

                # Eliminar alimentos actuales
                cur.execute("DELETE FROM dieta_tiene_alimentos WHERE id_dieta = %s", (id_dieta,))

                # Insertar nuevos alimentos
                for item in alimentos:
                    id_alimento = item.get("id_alimento")
                    cantidad = item.get("cantidad")
                    if id_alimento is None or cantidad is None:
                        continue
                    cur.execute("""
                        INSERT INTO dieta_tiene_alimentos (id_dieta, id_alimento, cantidad)
                        VALUES (%s, %s, %s)
                    """, (id_dieta, id_alimento, cantidad))

            conn.commit()

        return jsonify({
            "mensaje": "Dieta actualizada correctamente",
            "mezcla_nutricional": mezcla
        })

    except Exception as e:
        if 'conn' in locals():
            conn.rollback()
        return jsonify({"error": str(e)}), 500

@app.route("/eliminar_dieta/<int:id_dieta>", methods=["DELETE"])
def eliminar_dieta(id_dieta):
    try:
        with config['development'].conn() as conn:
            with conn.cursor() as cur:
                cur.execute("DELETE FROM dieta_tiene_alimentos WHERE id_dieta = %s", (id_dieta,))
                cur.execute("DELETE FROM dietas WHERE id_dieta = %s", (id_dieta,))
                conn.commit()

        return jsonify({"mensaje": "Dieta eliminada correctamente"})

    except Exception as e:
        return jsonify({"error": str(e)})


if __name__ == '__main__':
    app.run(debug=True)
