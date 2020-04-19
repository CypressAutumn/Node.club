$(document).ready(function(){
    var tasks = [];
    var gantt;
    var task_selected;    
    var id = getUrlParam('id')
    $.getJSON('/projectdata?id=' + id,function(data){
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

                $('#name').attr('placeholder',task.name);
                $('#start').val(task.start);
                $('#end').val(task.end);
                $('#dependencies').empty();
                $('#dependencies').append('<label>Dependencies</label>');
                for(i in tasks){
                    if(task.id != tasks[i].id){
                        //如果已经关联就选中，没有关联就不选中
                        if(task.dependencies.includes(tasks[i].id)){
                            $('#dependencies').append(
                                "<label class='checkbox-inline'><input type='checkbox' id='inlineCheckbox1' value="+tasks[i].id+" checked>"+tasks[i].name+"</label>"
                            );
                        }else{
                            $('#dependencies').append(
                                "<label class='checkbox-inline'><input type='checkbox' id='inlineCheckbox1' value="+tasks[i].id+">"+tasks[i].name+"</label>"
                            );
                        }
                        
                    }
                }
                console.log(task);
            },
            on_date_change: function(task, start, end) {
                console.log(task, start, end);
            },
            on_progress_change: function(task, progress) {
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
        $("#month").addClass('active')
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
        var nowTime = getFormatDate();
        var dep = tasks[0]['id']
        id = tasks.length.toString()
        task = {
            start: '2020-04-17',
			end: '2020-04-21',
			name: 'New Task',
            id: id,
            dependencies: [dep],
			progress: 50,
        	custom_class: 'bar-milestone'
        }
        tasks.push(task)
        gantt_chart.refresh(tasks)
    });

    $('#myModal').on('show.bs.modal',function (e) {
    });

    $('#save_changes').click(function(){
        
    });

    $('#datetimepicker1').datetimepicker();

});


function getUrlParam(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
    var r = window.location.search.substr(1).match(reg);  //匹配目标参数
    if (r != null) return unescape(r[2]); return null; //返回参数值
}

function getFormatDate(){
    var nowDate = new Date();
    var year = nowDate.getFullYear();
    var month = nowDate.getMonth() + 1 < 10 ? "0" + (nowDate.getMonth() + 1) : nowDate.getMonth() + 1;
    var date = nowDate.getDate() < 10 ? "0" + nowDate.getDate() : nowDate.getDate();
    var hour = nowDate.getHours()< 10 ? "0" + nowDate.getHours() : nowDate.getHours();
    var minute = nowDate.getMinutes()< 10 ? "0" + nowDate.getMinutes() : nowDate.getMinutes();
    var second = nowDate.getSeconds()< 10 ? "0" + nowDate.getSeconds() : nowDate.getSeconds();
    return year + "-" + month + "-" + date+" "+hour+":"+minute+":"+second;
}