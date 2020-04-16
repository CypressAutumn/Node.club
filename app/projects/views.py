import json
from flask import render_template, session, redirect, url_for, current_app, request, flash, jsonify
from flask_login import login_required, current_user
from .. import db
from ..models import User, Project, Task
from . import projects
from .forms import ProjectFrom,TaskFrom

@projects.route('/projects', methods=['GET', 'POST'])
def project():
    form = ProjectFrom()
    if form.validate_on_submit():
        #这里以后需要加入条数限制还有数据验证
        project = Project(name=form.name.data, intro=form.intro.data, user_id=current_user.id)
        db.session.add(project)
        db.session.commit()
        flash('A New Project was created.')
    
    projects = Project.query.filter_by(user_id=current_user.id).all()
    return render_template('projects.html', form=form, projects=projects)

@projects.route('/projectview', methods=['GET', 'POST'])
def projectview():
    form = TaskFrom()
    project_id = request.args.get('id')
    if form.validate_on_submit():
        task = Task(name=form.name.data, start=form.start.data, end=form.end.data, progress=form.progress.data, dependencies=form.dependencies.data, custom_class=form.color.data, project_id=project_id)
        db.session.add(task)
        db.session.commit()
        flash('A New Task was created.')
    tasks = Task.query.filter_by(project_id=project_id).all()
    

    return render_template('projectview.html', form=form, tasks=tasks)

@projects.route('/projectdata', methods=['GET', 'POST'])
def projectdata():
    project_id = request.args.get('id')
    tasks = Task.query.filter_by(project_id=project_id).all()
    task_list = []
    for task in tasks:
        task_json = {
            "start": task.start,
            "end": task.end,
            "name": task.name,
            "id": str(task.id),
            "dependencies": str(task.dependencies),
            "progress": task.progress,
            "custom_class": task.custom_class
        }
        task_list.append(task_json)
    return jsonify(task_list)