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
    '''
        这段太复杂啦，所以需要注释一下：
        1、通过参数过去项目ID（project_id）
        2、判断HTTP请求模式
        如果是提交数据（POST请求）：
            a、建立空数组变量 用于临时存储已经在数据表中的任务ID，以便下面判断是更新还是插入 （id_group）
            b、查询项目ID拉取任务数据，如查不到相关数据，说明URL中传递过来的参数是假的或者有误，直接跳转到404
            c、将任务数据中的任务ID .append() 到空数组变量id_group中
            d、获取POST提交的经过编辑的项目数据（data），然后 json.loads() 为json对象
            e、循环取出，客户端传递过来的经过编辑的项目数据（new_tasks），然后分两种情况：
                。一种已经存在于数据库中的任务，那么更新数据条目
                。一种不存在于数据库中的任务，那么插入新条目
                是否存在于数据库中就用:new_tasks中的id，是否存在于id_group中来判断，更新完现有条目后，
                将已经更新完成的new_tasks的id从id_group中删除，这样id_group中剩下id的就是在客户操作的过程中，
                删除的，那么再将这些id从数据库中删除就可以了。
    '''
    project_id = request.args.get('id')
    if request.method == 'POST':
        id_group = [] 
        old_tasks = Task.query.filter_by(project_id=project_id).all()
        if len(old_tasks) < 1: #如果没有记录，说明ID不存在，不用进一步操作
            return render_template('index.html') #这里要返回404
        for old_task in old_tasks:
            id_group.append(old_task.id)
        data = request.get_data()
        new_tasks = json.loads(data)
        for new_task in new_tasks:
            dep = ''
            if len(new_task['dependencies']) > 0:
                    for item in new_task['dependencies']:
                        dep = dep+','+item
            #如果该任务存在于数据中就更新，否则就插入，数据库中有，新项目数据中没有，那么删除数据中的条目
            if new_task['id'] in id_group:
                task = Task.query.filter_by(id=new_task['id']).first()
                task.name = str(new_task["name"])
                task.start = str(new_task['start'])
                task.end = str(new_task['end'])
                task.progress = str(new_task['progress'])
                task.dependencies = str(dep)
                task.custom_class = str(new_task['custom_class'])
                db.session.add(task)
                db.session.commit()
                id_group.remove(new_task['id'])
            else:
                task = Task(name=new_task['name'], start=new_task['start'], end=new_task['end'], progress=new_task['progress'], dependencies=dep, custom_class=new_task['custom_class'],project_id=project_id)
                db.session.add(task)
                db.session.commit()

        #已经在前端的删除任务后端的数据库也需要删除
        for item in id_group:
            del_task = Task.query.filter_by(id=item).first()
            db.session.delete(del_task)
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