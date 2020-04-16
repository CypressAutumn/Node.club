$(document).ready(function(){
    var tasks = []
    $.getJSON('/projectdata?id=1',function(data){
        tasks = data;
        var view_mode = 'Day';
        gannt(tasks,view_mode)
    });
    
    $("#year").click(function(){
        var view_mode = 'Year';
        $(".gantt-target").empty();
        gannt(tasks,view_mode)
    });

    $("#month").click(function(){
        var view_mode = 'Month';
        $(".gantt-target").empty();
        gannt(tasks,view_mode)
    });

    $("#week").click(function(){
        var view_mode = 'Week';
        $(".gantt-target").empty();
        gannt(tasks,view_mode)
    });

    $("#day").click(function(){
        var view_mode = 'Day';
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