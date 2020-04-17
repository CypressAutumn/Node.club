$(document).ready(function(){
    var tasks = [];
    var view_mode = 'Day';
    var id = getUrlParam('id')
    $.getJSON('/projectdata?id=' + id,function(data){
        tasks = data;
        /*tasks = [
			{
				start: '2018-10-01',
				end: '2018-10-08',
				name: 'Redesign website',
				id: "Task 0",
				progress: 20
			},
			{
				start: '2018-10-03',
				end: '2018-10-06',
				name: 'Write new content',
				id: "Task 1",
				progress: 5,
				dependencies: 'Task 0'
			},
			{
				start: '2014-01-05',
				end: '2019-10-12',
				name: 'Long term task',
				id: "Task 6",
				progress: 0
			}
		]*/
        view_mode = 'Day';
        gannt(tasks,view_mode)
    });
    
    $("#year").click(function(){
        view_mode = 'Year';
        $(".gantt-target").empty();
        gannt(tasks,view_mode)
    });

    $("#month").click(function(){
        view_mode = 'Month';
        $(".gantt-target").empty();
        gannt(tasks,view_mode)
    });

    $("#week").click(function(){
        view_mode = 'Week';
        $(".gantt-target").empty();
        gannt(tasks,view_mode)
    });

    $("#day").click(function(){
        view_mode = 'Day';
        $(".gantt-target").empty();
        gannt(tasks,view_mode)
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
        $(".gantt-target").empty();
        gannt(tasks,view_mode)
    });

});

function gannt(tasks,view_mode){
    var gantt_chart = new Gantt(".gantt-target", tasks, {
        on_click: function (task) {
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
        view_mode: view_mode,
        language: 'en'
        });
}

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