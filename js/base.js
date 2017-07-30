/**
 * Created by Administrator on 2017/7/27.
 */

//严格运行
;(function(){
    'use strict';
    // 获取变量
    var $form_add_task = $('.add-task')
        , $window = $(window)
        , $body = $('body')
        , $task_delete_trigger
        , $task_detail
        , $task_detail_trigger
        , $task_detail = $('.task-detail')
        , $task_detail_mask = $('.task-detail-mask')
        ,task_list = []
        ,current_index
        ,$update_form
        ,$task_detail_content
        ,$task_detail_content_input
        ,$checkbox_complete
        ,$msg = $('.msg')
        ,$msg_content = $msg.find('.msg-content')
        ,$msg_confirm = $msg.find('.confirmed')
        ,$alerter = $('.alerter');

    //调用函数
    init();

    $form_add_task.on('submit',on_add_task_form_submit);
    $task_detail_mask.on('click',hide_task_detail);

    function pop(arg){
        if (!arg){
            console.error('pop title is required')
        }
        var conf = {}
            , $box
            , $mask
            , $title
            , $content
            , $confirm
            , $cancel
            , dfd
            , confirmed
            ,timer;

        dfd = $.Deferred();

        if (typeof arg == "string"){
            conf.title = arg;
        } else {
            conf = $.extend(conf, arg);
        }

        $box = $('<div>' +
            '<div class="pop-title">'+conf.title+'</div>' +
            '<div class="pop-content"' +
                '<div><button style="margin-right: 5px;" class="primary confirm">确定</button><button class="cancel">取消</button>'+
            '</div>')
            .css({
                position : 'fixed',
                width : 300,
                height : 'auto',
                background : '#fff',
                'border-radius' : 3,
                'box-shadow' : '0 1p 2px rgba(0,0,0,.5)',
                color : "#444",
                padding : '15px'
            })

        $title = $box.find('.pop-title').css({
            padding : '5px 10px',
            'font-weight' : 900,
            'font-size' : 20,
            'text-align' : 'center'
        })

        $content = $box.find('.pop-content').css({
            padding : '5px 10px',
            'text-align' : 'center'
        })

        $confirm = $content.find('button.confirm');
        $cancel = $content.find('button.cancel');

        $mask = $('<div></div>')
            .css({
                position : 'fixed',
                top : 0,
                bottom : 0,
                left : 0,
                right : 0,
                background : 'rgba(0,0,0,.5)'
            })

        timer = setInterval(function(){
            if (confirmed != undefined){
                dfd.resolve(confirmed);
                clearInterval(timer);
                dismiss_pop();
            }
        },50)

        $confirm.on('click', on_confirmed);
        $cancel.on('click', on_cancel);
        $mask.on('click',on_cancel);

        function on_cancel(){
            confirmed = false;
        }
        function on_confirmed(){
            confirmed = true;
        }

        function dismiss_pop(){
            $mask.remove();
            $box.remove();
        }

        function adjust_box_position(){
            var window_width = $window.width(),
                window_height = $window.height(),
                box_width = $box.width(),
                box_height = $box.height(),
                move_x,
                move_y;

            move_x = Math.round((window_width - box_width)/2);
            move_y = Math.round((window_height - box_height)/2 - 30);

            $box.css({
                left : move_x,
                top : move_y
            });
        }


        $window.on('resize',function(){
            adjust_box_position();
        })


        //console.log(conf);
        $mask.appendTo($body);
        $box.appendTo($body);
        $window.resize();
        return dfd.promise();
    }

    function listen_msg_event(){
        $msg_confirm.on('click',function(){
            hide_msg();
        })
    }

    function on_add_task_form_submit(e){
        // 获取变量
        var new_task = {},$input;
        //preventDefault() 方法 取消事件的默认动作
        e.preventDefault();
        //获取新task的值
        $input =$(this).find('input[name=content]');

        new_task.content = $input.val();
        //如果新task的值为空 则返回 否侧继续执行
        if (!new_task.content) return;
        //有内容 存入新的task
        if(add_task(new_task)){
            $input.val(null);
        }
    }

    //查找并监听所有的删除按钮的点击事件
    function listen_task_delete(){
        //当前删除元素功能  绑定单击事件
        $task_delete_trigger.on('click',function(){
            //获取当前的this 保存给 $this
            var $this = $(this);
            //找到删除按钮所在的task元素 上上个父元素
            var $item = $this.parent().parent();
            //纠正不能删除的错误 index书写错误
            //找到当前父元素的索引值
            var index = $item.data('index');
            //确认删除 api
            //var tmp = confrim('确定删除?')
            pop('确定删除?')
                .then(function(r){
                    r?delete_task(index):null;
                })

            //三元运算符 判断 调用 delete_task()
            //tmp?delete_task(index):null;
        })
    }
    //查找并监听所有的详情按钮的点击事件
    function listen_task_detail(){
        var index;
        //列表双击打开详情列表
        $('.task-item').on('dblclick',function(){
            index = $(this).data('index');
            show_task_detail(index);
        })
        $task_detail_trigger.on('click',function(){
            var $this = $(this);
            var $item = $this.parent().parent();
            index = $item.data('index');
            show_task_detail(index);
        })
    }
    //注册 监听完成task任务事件
    function listen_checkbox_complete(){
        $checkbox_complete.on('click',function(){
            var $this = $(this);
            var index = $this.parent().parent().data('index')
            var item = get(index);
            if (item.complete){
                update_task(index, {complete : false});
            } else {
                update_task(index, {complete : true});
            }

        })
    }

    function get(index){
        return store.get('task_list')[index];
    }

    //查看task详情
    function show_task_detail(index){
        //生成详情模版
        render_task_detail(index);
        current_index = index;
        //显示详情模版 默认隐藏
        $task_detail.show();
        //显示详情模版mask 默认隐藏
        $task_detail_mask.show();

    }
    //隐藏task详情
    function hide_task_detail(){
        $task_detail.hide();
        $task_detail_mask.hide();
    }
    //渲染指定task的详情信息
    function render_task_detail(index){
        if (index === undefined || !task_list[index]) return;
        var item = task_list[index];
        var tpl = '<form>'+
            '<div class="content">'+
            item.content+
            '</div class="input-item">'+
                '<div><input style="display: none" type="text" name="content" value="'+(item.content || '')+'"></div>'+
            '<div>'+
            '<div class="desc input-item">'+
            '<textarea name="desc"> '+  (item.desc || '')+' </textarea>'+
            '</div>'+
            '</div>'+
            '<div class="remind input-item">'+
                '<label>提醒时间</label>'+
            '<input class="datetime" name="remind_date" type="text" value="'+ (item.remind_date || '') +'">'+
            '</div>'+
                '<div class="input-item"><button type="submit">更新</button></div>'+
            '</form>';
        //清空task详情模版
        $task_detail.html(null);
        //用新模版 替换 旧模版
        $task_detail.html(tpl);
        $('.datetime').datetimepicker();


        //选择其中一个的form元素 因为之后会使用其监听事件 submint
        $update_form = $task_detail.find('form');
        //选中选择task内容元素
        $task_detail_content = $update_form.find('.content');
        //选中task input元素
        $task_detail_content_input = $update_form.find('[name=content]');
        //双击内容元素显示input 隐藏自己
        $task_detail_content.on('dblclick',function(){
            $task_detail_content_input.show();
            $task_detail_content.hide();
        })

        $update_form.on('submit',function(e){
            e.preventDefault();
            var data = {};
            //获取表单中各个input的值
            data.content = $(this).find('[name=content]').val();
            data.desc = $(this).find('[name=desc]').val();
            data.remind_date = $(this).find('[name=remind_date]').val();


            update_task(index, data);
            hide_task_detail();
        })
    }

    //更新task
    function update_task(index, data){
        if (index === undefined || !task_list[index]) return;
        task_list[index] = $.extend({}, task_list[index], data);
        refresh_task_list();
    }

    //增加task
    function add_task(new_task){
        //将新的task推入task_list
        task_list.push(new_task);
        //更新localstorage
        refresh_task_list();
        return true;
    }
    //刷新 localStorage数据并渲染模版view
    function refresh_task_list(){
        //设置内容 sotre.set
        store.set('task_list',task_list);
        //调用 render_task_list  渲染全部task模版
        render_task_list();
    }
    //删除一条task
    function delete_task(index){

        //如果没有index 或者index不存在则直接返回
        if (index === undefined || !task_list[index]) return;
        //删除task_list
        delete task_list[index];

        //更新localstorage
        refresh_task_list();
    }

    // 获取task_list的值 和 []
    function init(){
        //清空
        //store.clear();
        task_list = store.get('task_list') || [];
        listen_msg_event();
        //如果有内容 调用render_task_list
        if(task_list.length){
            render_task_list();
            task_remind_check();
        }
    }

    function task_remind_check(){
        //测试显示show_msg
        //show_msg('lalalal');
        var current_timestamp;
        var itl = setInterval(function(){
            for(var i = 0; i < task_list.length; i++){
                var item = get(i), task_timestamp;
                if (!item || !item.remind_date || item.informed) {
                    continue;
                }
                    current_timestamp =(  new Date() ).getTime();
                    task_timestamp =(  new Date(item.remind_date) ).getTime();
                    if ( (current_timestamp - task_timestamp) >= 1){
                        update_task(i, {informed : true});
                        show_msg(item.content);
                    }
            }
        }, 1000)

    }

    function show_msg(msg){
        if( !msg ) return;
        $msg_content.html(msg);
        //播放声音
        $alerter.get(0).play();
        $msg.show();
    }

    function hide_msg(msg){
        $msg.hide();
    }
    //渲染全部task模版
    function  render_task_list(){
        //获取 task_list
        var $task_list = $('.task-list');
        //清空task_list的html
        $task_list.html('');
        var complete_items =[];
        //for循环 task_list
        for(var i=0;i<task_list.length;i++){
            var item = task_list[i];
            if(item && item.complete){
                complete_items[i] = item;
            } else {
                //调用render_task_item 参数 task_list的第i个 当前的task_list  和 i 索引值
                var $task = render_task_item(item, i);
                //将渲染后的 task插入到 内容 task_list中
                $task_list.prepend($task);
            }
        }


        for(var j = 0;j < complete_items.length; j++){
            $task = render_task_item(complete_items[j], j);
            if (!$task) continue;
            $task.addClass('completed');
            $task_list.append($task);
        }

        //调用删除元素键的元素方法
        $task_delete_trigger = $('.action.delete');
        $task_detail_trigger = $('.action.detail');

        $checkbox_complete = $('.task-list .complete[type=checkbox]');
        //调用删除方法 同上一起调用
        listen_task_delete();
        listen_task_detail();

        listen_checkbox_complete();
    }
    //渲染单挑task模版
    function render_task_item(data, index){
        //判断是否有值
        if (!data || !index) return;
        var list_item_tpl =
            '<div class="task-item" data-index="'+ index+'">'+
                '<span><input class="complete" '+(data.complete ? 'checked' : '')+' type="checkbox"></span>'+
                '<span class="task-contetn">'+ data.content + '</span>'+
            '<span class="fr">'+
                '<span class="action delete"> 删除</span>'+
                '<span class="action detail"> 详情</span>'+
            '</pan>'+
            '</div>';
        //返回这个模版
        return $(list_item_tpl);
    }


    function conlog(event){
        console.log(event);
    }
})();