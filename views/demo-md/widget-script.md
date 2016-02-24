```
<script type="text/javascript">
	cola(function (model) {
		model.describe({
            email: {
                validators: ["required",
                 "email"]
            }
        });
        model.action({
            save:function(){
                alert(model.get("email"))
            },
            clear:function(){
                model.set("email","")
            }
        })
	});
</script>
```