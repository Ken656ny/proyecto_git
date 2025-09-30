from decouple import config
import pymysql
import pymysql.cursors
import secrets

class Config():
    SECRET_KEY = secrets.token_hex(32)
    DEBUG = config('DEBUG', cast=bool)

class DevelopmentConfig(Config):
    HOST = 'localhost'
    USER = 'root'
    PASSWORD = '1711'
    DATABASE = 'edupork'
    CURSOR_CLASS = pymysql.cursors.DictCursor

    @classmethod
    def conn(self):
        return pymysql.connect(host=self.HOST,user=self.USER,passwd=self.PASSWORD,db=self.DATABASE, cursorclass=self.CURSOR_CLASS) 

config = {
    'development' : DevelopmentConfig
}