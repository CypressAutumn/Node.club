from flask import render_template, session, redirect, url_for, current_app
from .. import db
from ..models import User, Project, Task
from . import projects
from .forms import ProjectFrom

@projects.route('/projects', methods=['GET', 'POST'])
def index():
    form = ProjectFrom()
    return render_template('projects.html', form=form)