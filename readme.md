# canvas live coding environment.

This live coding environment exposes an html5 canvas tag. It is developped as a side project/test for the ["exquis"](https://github.com/gongfuio/Exquis) environment. It explores the possibility of simplifying the current "exquis" user syntax. 

You can play around with it [here](http://david-hodgetts.github.io/exquis_syntactic_sugar_test/). The code is locally persisted (localstorage).

## idea
Transform user syntax of type:

      // any setup code      
      var i = 0;

      // called repeatedly 
      function draw(){
        ctx.fillRect(i, i, 10, 10);
      }


Into an internal clojure representation for live evaluation:

      function(ctx){
        var i = 0;

        return{
          draw: function draw(){
            ctx.fillRect(i, i, 10, 10);
          }
        }
      }

This uses the javascript ast parser [esprima](http://esprima.org/) to find the draw function declaration and prepare the clojure private body, [escodegen](https://github.com/Constellation/escodegen) to regenerate code from the asts, and the [ace editor](http://ace.c9.io/#nav=about) for code edition.

## installation

run from any http server, for instance with python:

    python -m SimpleHTTPServer
    open browser at http://localhost:8000/

## usage


### canvas context

write live evalled code for the canvas element at the top of the page. The canvas' 2d context is accessed through ctx. Example:

   
    ctx.fillStyle = "red";
    ctx.fillRect(0, 0, 10, 10);
    var i = 0;

    function draw(){
      // this function is called repeatedly
      ctx.fillRect(i, 0, 10, 10);
      i = (i + 1) % ctx.canvas.width;
    }


### input

input object handles mouse information


    function draw(){

      if (input.getMouseButton()){
        // true as long as mouse is down;
        var mousePosition = input.getMousePosition();
        ctx.fillRect(mousePosition.x, mousePosition.y, 10, 10);
      }

      if (input.getMouseButtonDown()){
        // true on frame where mouse is down
        console.log("down event")
      }

      if (input.getMouseButtonUp()){
        // true on frame where mouse is up
        console.log("up event")
      }
    }

### config

config object handles app configuration

      // changes canvas size to width=400 height=300
      config.size(400, 300);

      // toggles vim mode in editor
      config.vi()

      // toggles emacs mode in editor
      config.emacs()

      // remove keyboardHandler (default state)
      config.noKeyboardHandler()

