from random import randint

from faker import Faker

from app import app
from models import db, Article, User

fake = Faker()

with app.app_context():
    pass