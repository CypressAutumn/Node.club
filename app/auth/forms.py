from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, BooleanField, SubmitField 
from wtforms.validators import DataRequired, Length, Email, Regexp, EqualTo 
from wtforms import ValidationError
from ..models import User

class LoginForm(FlaskForm):
    mobile = StringField('Mobile', validators=[DataRequired()])
    password = PasswordField('Password', validators=[DataRequired()])
    remember_me = BooleanField('Keep me logged in')
    submit = SubmitField('Log In')

class RegistrationForm(FlaskForm):
    mobile = StringField('Mobile', validators=[DataRequired()])
    username = StringField('Username', validators=[
        DataRequired(), Length(1, 64),
        Regexp('^[A-Za-z][A-Za-z0-9_.]*$', 0,
               'Usernames must have only letters, numbers, dots or '
               'underscores')])
    password = PasswordField('Password', validators=[
        DataRequired(), EqualTo('password2', message='Passwords must match.')])
    password2 = PasswordField('Confirm password', validators=[DataRequired()])
    submit = SubmitField('Register')

    def validate_mobile(self, field):
        if User.query.filter_by(mobile=field.data.lower()).first():
            raise ValidationError('Mobile already registered.')

    def validate_username(self, field):
        if User.query.filter_by(username=field.data).first():
            raise ValidationError('Username already in use.')
