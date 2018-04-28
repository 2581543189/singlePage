$(function(){
   //
});

function validateForm(){
    var userName = $("#userName").val();
    var password=$("#password").val();
    if(userName==""){
        $(".login-box-msg").text("用户名不能为空!");
        return false;
    }
    if(password==""){
        $(".login-box-msg").text("密码不能为空!");
        return false;
    }
    return true;
}