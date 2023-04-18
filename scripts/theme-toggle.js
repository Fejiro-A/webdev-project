$(document).ready(function() {
    if (localStorage.getItem("theme") == "dark") {
        $(document.documentElement).attr("data-theme", "dark");
        $("#theme-icon").removeClass("fa-moon");
            $("#theme-icon").addClass("fa-sun");
    } else {
        $(document.documentElement).attr("data-theme", "light");
        $("#theme-icon").removeClass("fa-sun");
        $("#theme-icon").addClass("fa-moon");
    }

    $("#theme-toggle").click(function() {
        var current = $(document.documentElement).attr("data-theme");
        
        if (current === "light") {
            $(document.documentElement).attr("data-theme", "dark");
            localStorage.setItem("theme", "dark");
            $("#theme-icon").removeClass("fa-moon");
            $("#theme-icon").addClass("fa-sun");
        } else {
            $(document.documentElement).attr("data-theme", "light");
            localStorage.setItem("theme", "light");
            $("#theme-icon").removeClass("fa-sun");
            $("#theme-icon").addClass("fa-moon");
        }
    });
});
