from config import config

def obtener_info_usuario(usuario):
    try:
        if usuario.get('es_google') is True:
            return usuario['id_usuario'], 'Externo'
        else:
            return usuario['id_auto'], 'Interno'
    except Exception as err:
        print('soy el error',err)

def crear_notificacion(usuario_dest,usuario_origen,titulo,mensaje,tipo="General",url_referencia=None):
    try:
        
        dest_id, dest_tipo = obtener_info_usuario(usuario_dest)
        origen_id, origen_tipo = obtener_info_usuario(usuario_origen)
        
        with config['development'].conn() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO notificaciones
                    (destinatario_id, destinatario_tipo,
                    origen_id, origen_tipo,
                    titulo, mensaje, tipo, url_referencia)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    dest_id,
                    dest_tipo,
                    origen_id,
                    origen_tipo,
                    titulo,
                    mensaje,
                    tipo,
                    url_referencia
                ))
                conn.commit()
    except Exception as err:
        print(err)