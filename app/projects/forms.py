#coding=utf-8
from datetime import datetime
from flask_wtf import FlaskForm
from flask_ckeditor import CKEditorField
from wtforms import StringField, SubmitField, TextAreaField, DateTimeField, IntegerField, SelectField
from wtforms.validators import DataRequired


class ProjectFrom(FlaskForm):
    name = StringField('Project Name?', validators=[DataRequired()])
    intro = TextAreaField('About Introduction?', validators=[DataRequired()])
    submit = SubmitField('Submit')

class TaskFrom(FlaskForm):
    name = StringField('Task Name?', validators=[DataRequired()])
    start = DateTimeField('Start Time:', default=datetime.now())
    end = DateTimeField('End Time:', default=datetime.now())
    progress = IntegerField('Progress')
    dependencies = IntegerField('Father Task')
    color = StringField('Color', validators=[DataRequired()])
    submit = SubmitField('Submit')