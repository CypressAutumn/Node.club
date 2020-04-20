$(document).ready(function(){
    var tasks = [];
    var gantt;
    var project_id = getUrlParam('id')
    $.getJSON('/projectdata?id=' + project_id,function(data){
        tasks = data;
        gantt_chart = new Gantt(".gantt-target", tasks, {
            custom_popup_html: function(task) {
                // the task object will contain the updated
                // dates and progress value
                return `
                  <div class="details-container">
                    <h5>${task.name}<button type="button" data-toggle="modal" data-target="#myModal" class="btn btn-warning btn-xs col-xs-offset-3"><span class="glyphicon glyphicon-edit" aria-hidden="true"></span></button></h5>
                    <span>Start: ${task.start}</span>
                    <span>End: ${task.end}</span>
                    <span>Progress: ${task.progress}%</span>
                  </div>
                `;
            },
            on_click: function (task){
                $('#name').attr('data-id',task.id);
                $('#name').val(task.name);
                $('#start').val(task.start);
                $('#end').val(task.end);
                $('#progress').val(task.progress);
                $('#dependencies').empty();
                if(tasks.length > 1){
                    $('#dependencies').append('<label>Dependencies</label>');
                }
                for(i in tasks){
                    if(task.id != tasks[i].id){
                        //如果已经关联就选中，没有关联就不选中
                        if(task.dependencies.includes(tasks[i].id)){
                            $('#dependencies').append(
                                "<div class='checkbox'><label><input type='checkbox' value="+tasks[i].id+" checked>"+tasks[i].name+"</label></div>"
                            );
                        }else{
                            $('#dependencies').append(
                                "<div class='checkbox'><label><input type='checkbox' value="+tasks[i].id+">"+tasks[i].name+"</label></div>"
                            );
                        }
                        
                    }
                }
                console.log(task);
            },
            on_date_change: function(task, start, end){
                var task_id = task.id;
                var start_time = moment(start).format('YYYY-MM-DD HH:mm');
                var end_time = moment(end).format('YYYY-MM-DD HH:mm');
                for(i in tasks){
                    if(tasks[i].id == task_id){
                        tasks[i].start = start_time;
                        tasks[i].end = end_time;
                    }
                }
                console.log(task, start, end);
            },
            on_progress_change: function(task, progress){
                var task_id = task.id;
                for(i in tasks){
                    if(tasks[i].id == task_id){
                        tasks[i].progress = progress;
                    }
                }
                console.log(task, progress);
            },
            on_view_change: function(mode) {
                console.log(mode);
            },
            view_mode: 'Day',
            language: 'en'
            });
    });
    $("#year").click(function(){
        $('ul.pagination li').removeClass("active");
        $("#year").addClass('active')
        gantt_chart.change_view_mode('Year');
    });

    $("#month").click(function(){
        $('ul.pagination li').removeClass("active");
        $("#month").addClass('active')
        gantt_chart.change_view_mode('Month');
    });

    $("#week").click(function(){
        $('ul.pagination li').removeClass("active");
        $("#week").addClass('active')
        gantt_chart.change_view_mode('Week');
    });

    $("#day").click(function(){
        $('ul.pagination li').removeClass("active");
        $("#day").addClass('active')
        gantt_chart.change_view_mode('Day');
    });

    $("#half_day").click(function(){
        $('ul.pagination li').removeClass("active");
        $("#half_day").addClass('active')
        gantt_chart.change_view_mode('Half Day');
    });

    $("#quarter_day").click(function(){
        $('ul.pagination li').removeClass("active");
        $("#quarter_day").addClass('active')
        gantt_chart.change_view_mode('Quarter Day');
    });

    $('#create').click(function(){
        var start_time = getFormatDate('d ',0);
        var end_time = getFormatDate('d ',7);
        var task_id  = tasks.length.toString();
        task = {
            name: 'New Task',
            start: start_time,
			end: end_time,
            id: task_id,
			progress: 50,
            custom_class: 'grey',
            dependencies: []
        }
        tasks.push(task);
        gantt_chart.refresh(tasks);
        console.log(tasks)
    });

    $('#delete_task').click(function(){
        var r=confirm('Are you sure to delect this task?')
        if(r){
            /*
             1. 申明一个新的空数组
             2. 然后跳过需要删除的元素，将其他元素添加到新数组
             3. 将新数组赋值给老的tasks数组
             4. 刷新画面
             */
            var temp_tasks = [];
            var task_id = $('#name').attr('data-id');
            for(i in tasks){
                if(tasks[i].id != task_id){
                    temp_tasks.push(tasks[i]);
                }
            }
            tasks = temp_tasks;
            $('#myModal').modal('hide');
            gantt_chart.refresh(tasks);
        }
    })


    $('#save_changes').click(function(){

        var dep = [];
        //找出匹配的task
        var task_id = $('#name').attr('data-id');
        $.each($('input:checkbox:checked'),function(){
            dep.push($(this).val());
        });

        for(i in tasks){
            if(tasks[i].id == task_id){
                tasks[i].start = $('#start').val();
                tasks[i].end = $('#end').val();
                tasks[i].name = $('#name').val();
                tasks[i].progress = $('#progress').val();
                tasks[i].custom_class = $('#color').val();
                tasks[i].dependencies = dep;
            }
        }
        $('#myModal').modal('hide');
        gantt_chart.refresh(tasks);
    });

    $('#save').click(function(){
        $.ajax({
            type: "post",
            url: '/projectdata?id=' + project_id,
            dataType : 'json',
            contentType : 'application/json',
            data: JSON.stringify(tasks),
            success: function (data) {
                tasks = data;
                gantt_chart.refresh(tasks);
            }
        });
    });
    $('#datetimepicker1').datetimepicker({format:'YYYY-MM-DD HH:mm'});
    $('#datetimepicker2').datetimepicker({format:'YYYY-MM-DD HH:mm'});

});


function getUrlParam(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
    var r = window.location.search.substr(1).match(reg);  //匹配目标参数
    if (r != null) return unescape(r[2]); return null; //返回参数值
}

function getFormatDate(type, num){
    var nowDate = new Date();
    var nowDate = DateAdd(type, num, nowDate);
    var year = nowDate.getFullYear();
    var month = nowDate.getMonth() + 1 < 10 ? "0" + (nowDate.getMonth() + 1) : nowDate.getMonth() + 1;
    var date = nowDate.getDate() < 10 ? "0" + nowDate.getDate() : nowDate.getDate();
    var hour = nowDate.getHours()< 10 ? "0" + nowDate.getHours() : nowDate.getHours();
    var minute = nowDate.getMinutes()< 10 ? "0" + nowDate.getMinutes() : nowDate.getMinutes();
    return year + "-" + month + "-" + date+" "+hour+":"+minute;
}

function DateAdd(interval, number, date) {
    switch (interval) {
    case "y ": {
        date.setFullYear(date.getFullYear() + number);
        return date;
        break;
    }
    case "q ": {
        date.setMonth(date.getMonth() + number * 3);
        return date;
        break;
    }
    case "m ": {
        date.setMonth(date.getMonth() + number);
        return date;
        break;
    }
    case "w ": {
        date.setDate(date.getDate() + number * 7);
        return date;
        break;
    }
    case "d ": {
        date.setDate(date.getDate() + number);
        return date;
        break;
    }
    case "h ": {
        date.setHours(date.getHours() + number);
        return date;
        break;
    }
    case "m ": {
        date.setMinutes(date.getMinutes() + number);
        return date;
        break;
    }
    case "s ": {
        date.setSeconds(date.getSeconds() + number);
        return date;
        break;
    }
    default: {
        date.setDate(d.getDate() + number);
        return date;
        break;
    }
    }
}