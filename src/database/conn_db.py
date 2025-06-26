import pymysql

def conexion():
    try:
        return pymysql.connect(host='')
        
    except Exception as error:
        print(error)