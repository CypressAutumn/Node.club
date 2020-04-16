from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin
from . import login_manager
from . import db


class Project(db.Model):
    __tablename__ = 'projects'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), unique=True)
    intro = db.Column(db.String(300), unique=True)
    user_id = db.Column(db.Integer, db.ForeignKey('roles.id'))

class Task(db.Model):
    __tablename__ = 'tasks'
    id = db.Column(db.Integer, primary_key=True)
    start = db.Column(db.String(64), unique=True)
    end = db.Column(db.String(64), unique=True)
    name = db.Column(db.String(64), unique=True)
    progress = db.Column(db.String(64), unique=True)
    custom_class = db.Column(db.String(64), unique=True)
    dependencies = db.Column(db.Integer, db.ForeignKey('tasks.id'))
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'))

class Role(db.Model):
    __tablename__ = 'roles'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), unique=True)
    users = db.relationship('User', backref='role', lazy='dynamic')

    def __repr__(self):
        return '<Role %r>' % self.name


class User(UserMixin, db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    mobile = db.Column(db.String(64), unique=True, index=True)
    username = db.Column(db.String(64), unique=True, index=True)
    password_hash = db.Column(db.String(128))
    role_id = db.Column(db.Integer, db.ForeignKey('roles.id'))

    def __repr__(self):
        return '<User %r>' % self.username
    
    @property
    def password(self):
        raise AttributeError('password is not a readable attribute')
    
    @password.setter
    def password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def verify_password(self, password):
        return check_password_hash(self.password_hash, password)

    @login_manager.user_loader 
    def load_user(user_id):
        return User.query.get(int(user_id))
