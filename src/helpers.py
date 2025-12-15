import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import io
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

def generar_grafica_peso_etapa(historial):
    fechas = [str(h["fecha_pesaje"]) for h in historial]
    pesos = [float(h["peso_final"]) for h in historial]
    peso_min = [float(h["peso_min"]) for h in historial]
    peso_max = [float(h["peso_max"]) for h in historial]

    plt.figure(figsize=(9, 3))
    plt.plot(fechas, pesos, marker='o', label="Peso real")
    plt.plot(fechas, peso_min, linestyle='--', label="Peso mínimo etapa")
    plt.plot(fechas, peso_max, linestyle='--', label="Peso máximo etapa")

    plt.title("Histórico de peso vs rango de etapa")
    plt.xlabel("Fecha de pesaje")
    plt.ylabel("Peso (kg)")
    plt.legend()
    plt.grid(True)
    plt.xticks(rotation=45)

    buffer_img = io.BytesIO()
    plt.tight_layout()
    plt.savefig(buffer_img, format="png", dpi=150)
    plt.close()

    buffer_img.seek(0)
    return buffer_img
