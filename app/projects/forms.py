from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField
from wtforms.validators import DataRequired


class ProjectFrom(FlaskForm):
    name = StringField('Project Name?', validators=[DataRequired()])
    intro = StringField('About Introduction?', validators=[DataRequired()])
    submit = SubmitField('Submit')
