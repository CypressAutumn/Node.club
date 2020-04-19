import json, datetime
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
        #创建项目的时候创建一个原始任务
        start = datetime.datetime.now()
        start_format = start.strftime('%Y-%m-%d %H:%M')
        end = start + datetime.timedelta(days =10) #结束时间默认为10天后
        end_format = end.strftime('%Y-%m-%d %H:%M')
        task = Task(name=form.name.data, progress=50, start=str(start_format), end=str(end_format), custom_class='default', project_id=project.id)
        db.session.add(task)
        db.session.commit()
        return redirect('/projectview?id='+project.id)
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
    return render_template('projectview.html', form=form)

@projects.route('/projectdata', methods=['GET', 'POST'])
def projectdata():
    project_id = request.args.get('id')
    if request.method == 'POST':
        id_group = [] # 用于临时存储已经在数据表中的任务ID，以便下面判断是更新还是插入
        old_tasks = Task.query.filter_by(project_id=project_id).all()
        if len(old_tasks) < 1: #如果没有记录，说明ID不存在，不用进一步操作
            return render_template('index.html')
        for old_task in old_tasks:
            id_group.append(old_task.id)
        data = request.get_data()
        new_tasks = json.loads(data)
        for new_task in new_tasks:
            #如果存在就更新
            if new_task['id'] in id_group:
                dep = ''
                if len(new_task['dependencies']) > 0:
                    for item in new_task['dependencies']:
                        dep = dep+','+item
                task = Task.query.filter_by(id=new_task['id']).first()
                task.name = new_task['name']
                task.start = new_task['start']
                task.end = new_task['end']
                task.progress = new_task['progress']
                task.dependencies = dep
                task.custom_class = new_task['custom_class']
                db.session.commit()
            else:
                task = Task(name=new_task['name'], start=new_task['start'], end=new_task['end'], progress=new_task['progress'], dependencies=dep, custom_class=new_task['custom_class'],project_id=project_id)
                db.session.add(task)
                db.session.commit()
    tasks = Task.query.filter_by(project_id=project_id).all()
    task_list = []
    for task in tasks:
        dependencies = task.dependencies
        if task.dependencies is None:
            dependencies = ''
        task_json = {
            "start": task.start,
            "end": task.end,
            "name": task.name,
            "id": str(task.id),
            "dependencies": dependencies,
            "progress": task.progress,
            "custom_class": task.custom_class
        }
        task_list.append(task_json)
    return jsonify(task_list)