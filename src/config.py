from decouple import config
import pymysql
import secrets

class Config():
    SECRET_KEY = secrets.token_hex(32)
    DEBUG = config('DEBUG', cast=bool)

class DevelopmentConfig(Config):
    HOST = 'localhost'
    USER = 'root'
    PASSWORD = '290307'
    DATABASE = 'edupork'
    SQLALCHEMY_DATABASE_URI = config('SQLALCHEMY_DATABASE_URI')

    @classmethod
    def conn(self):
        return pymysql.connect(host=self.HOST,user=self.USER,passwd=self.PASSWORD,db=self.DATABASE) 

config = {
    'development' : DevelopmentConfig
}