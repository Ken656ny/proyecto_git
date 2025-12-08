from decouple import config
import pymysql
import pymysql.cursors
import secrets


class Config():
    SECRET_KEY = secrets.token_hex(32)
    DEBUG = config('DEBUG', cast=bool)

class DevelopmentConfig(Config):
    HOST = config('HOST')
    USER = config('USER')
    PASSWORD = config('PASSWORD')
    DATABASE = config('DATABASE')
    CURSOR_CLASS = pymysql.cursors.DictCursor
    SQLALCHEMY_DATABASE_URI = config('SQLALCHEMY_DATABASE_URI')

    @classmethod
    def conn(self):
        return pymysql.connect(host=self.HOST,user=self.USER,passwd=self.PASSWORD,db=self.DATABASE, cursorclass=self.CURSOR_CLASS) 

config = {
    'development' : DevelopmentConfig
}