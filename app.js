var main = function(){

    var editor,
        canvas = document.getElementById("myCanvas"),
        ctx = canvas.getContext("2d"),
        errorsTextField = document.getElementById("errors"),
        currentParseObject = null,
        animObj = null,
        input,
        config,
        localStorageKey = "saved_source";


    var getMousePos = function(canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };

    var buildInput = function(canvas){

        var mousePosition = {x:null, y: null},
            mouseDown = false,
            mouseDownEvent = false,
            mouseUpEvent = false;

        var result = {
            getMousePosition: function(){ return mousePosition; },
            getMouseButtonDown: function(){ return mouseDownEvent; },
            getMouseButtonUp: function(){ return mouseUpEvent; },
            getMouseButton: function(){ return mouseDown; },
            __postRenderCleanup: function(){
                //TODO this is hacky
                mouseDownEvent = false;
                mouseUpEvent = false;
            }
        };

        canvas.addEventListener('mousemove', function(e){
            mousePosition = getMousePos(canvas, e);
        });

        canvas.addEventListener('mousedown', function(e){
            mouseDown = true;
            mouseDownEvent = true;
        });

        document.documentElement.addEventListener('mouseup', function(e){
            if (mouseDown){
                mouseDown = false;
                mouseUpEvent = true; 
            }
        });

        return result;
    };

    var buildEditor = function(id){
        var result = ace.edit(id);
        result.getSession().setMode("ace/mode/javascript");
        result.setFontSize("16px");
        return result;
    };

    var buildConfig = function(editor, canvas){

        var vi = function(){ editor.setKeyboardHandler("ace/keyboard/vim"); },
            emacs = function() { editor.setKeyboardHandler("ace/keyboard/emacs"); },
            noKeyboardHandler = function() { editor.setKeyboardHandler(); };

        var size = function(width, height){
            var w = parseInt(width),
                h = parseInt(height),
                marginLeftOffset = 50;

            if (isNaN(w)  || isNaN(h)){
                return;
            }
            canvas.width = w;
            canvas.height = h;
            // css hack
            document.getElementById("right").style.marginLeft = (w + marginLeftOffset) + "px";
        };

        return {
            vi: vi,
            emacs: emacs,
            noKeyboardHandler: noKeyboardHandler,
            size: size
        };
    };


    var updateAnimObj = function(newParseObj){
        //the abomination
        var functionBody = parseExquis.buildFunctionBodyString(newParseObj),
            makeAnim;

        try{
            makeAnim = new Function("ctx", "input", "config", functionBody);
        }catch (e){
            errorsTextField.innerHTML = e.message;
            return;
        }

        try{
            testAnimObj = makeAnim(ctx, input, config);
        }catch (e){
            errorsTextField.innerHTML = e.message;
            return;
        }

        if (testAnimObj.draw != null){
            try {
                testAnimObj.draw();
            } catch(e){
                errorsTextField.innerHTML = e.message;
                return;
            }
        }

        animObj = testAnimObj;

        currentParseObject = newParseObj;
    };

    var resetMatrices = function(){
        ctx.setTransform(1, 0, 0, 1, 0, 0);
    };

    var handleNewParseObject = function(newParseObj){

        if (parseExquis.isFullCodeIdentical(currentParseObject, newParseObj)){
            return;
        }

        updateAnimObj(newParseObj);
    };

    var generalizeRequestAnimation = function(){
        window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    };

    var persistCodeString = function(codeString){ 
        window.localStorage.setItem(localStorageKey, codeString);
    };

    var onEditorChange = function(e){
        var codeString = editor.getValue();
        persistCodeString(codeString);

        var parseObj = parseExquis.stringToParseObject(codeString);

        if (parseObj.error != null){
            errorsTextField.innerHTML = parseObj.error.message;
            return;
        }

        errorsTextField.innerHTML = "";
        handleNewParseObject(parseObj);
    };

    var render = function(timestamp){
        if (animObj != null && animObj.draw != null){
            resetMatrices();
            try{
                animObj.draw();
            }catch(e){
                errorsTextField.innerHTML = e.message;
            } 
        }

        input.__postRenderCleanup();
        requestAnimationFrame(render);
    };


    input = buildInput(canvas);
    
    editor = buildEditor("editor");
    editor.getSession().on('change', onEditorChange);

    config = buildConfig(editor, canvas);

    f.maybe(function(saved_source){
        editor.setValue(saved_source);
        editor.getSession().selection.clearSelection();
    })(window.localStorage.getItem(localStorageKey));

    generalizeRequestAnimation();
    requestAnimationFrame(render);
}


window.onload = main;