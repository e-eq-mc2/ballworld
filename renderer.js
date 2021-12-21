const Matter = require("matter-js");
const Utils = require("./lib/common.js")
var Colormap = require("./lib/colormap.js")

const Engine          = Matter.Engine,
      Events          = Matter.Events,
      Runner          = Matter.Runner,
      Render          = Matter.Render,
      World           = Matter.World,
      Body            = Matter.Body,
      Mouse           = Matter.Mouse,
      MouseConstraint = Matter.MouseConstraint,
      Common          = Matter.Common,
      Composites      = Matter.Composites,
      Composite       = Matter.Composite,
      Bodies          = Matter.Bodies;
   
function init ( ) {
  // create engine
  const engine = Engine.create()
  const world = engine.world;

  const canvas = document.getElementById("blackboard")

  const w = window.innerWidth
  const h = window.innerHeight

  // create renderer
  const render = Render.create({
    element: document.body,
    engine: engine,
    canvas: canvas,
    options: {
      width: w,
      height: h,
      //showAngleIndicator: true,
      wireframes: false,
      background: '#000000',
      //pixelRatio: 'auto',
      pixelRatio: 1,
      hasBounds: true
    }
  });

  Render.run(render);

  // create runner
  const runner = Runner.create();
  Runner.run(runner, engine);

  // add odies
  //var stack = Composites.stack(100, 600 - 21 - 20 * 20, 10, 10, 20, 0, function(x, y) {
  //  return Bodies.circle(x, y, 20);
  //});

  const walls = new Walls(world, 100)
  const cloud = new Cloud(world)

  Composite.add(world, [
    //stack
  ]);

  // add mouse control
  const mouse = Mouse.create(render.canvas)
  const mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
      stiffness: 0.2,
      render: {
        visible: false
      }
    }
  });

  Composite.add(world, mouseConstraint);

  // keep the mouse in sync with rendering
  render.mouse = mouse;

  // fit the render viewport to the scene
  //Render.lookAt(render, {
  //  min: { x: 0, y: 0 },
  //  max: { x: w, y: h }
  //});

  window.addEventListener('resize', () => { 
    //Matter.Render.setPixelRatio(render, pixelRatio)
    const w = window.innerWidth
    const h = window.innerHeight

    render.bounds.max.x = w
    render.bounds.max.y = h

    render.options.width = w
    render.options.height = h

    render.canvas.width = w
    render.canvas.height = h

    walls.update(w, h)

    //render.canvas.setAttribute('width', w)
    //render.canvas.setAttribute('height', h)

    //Render.lookAt(render, {
    //  min: { x: 0, y: 0 },
    //  max: { x: w, y: h }
    //});

  });

  document.body.addEventListener("keydown", function(e) {
    console.log(`key: ${e.key}`);

    switch(true) {
      case e.key == '1':
        cloud.drop(10)
        break
      case e.key == '2':
        cloud.drop(20)
        break
      case e.key == '3':
        cloud.drop(40)
        break
      case e.key == '4':
        cloud.drop(80)
        break
      case e.key == '5':
        cloud.drop(160)
        break
      case e.key == '6':
        cloud.drop(320)
        break
      case e.key == '7':
        cloud.drop(600)
        break
      case e.key == '8':
        cloud.drop(1000)
        break
      case e.key == '9':
        cloud.drop(2000)
        break
      case e.key == '0':
        cloud.drop(3000)
        break

      case e.key == 'c':
        cloud.clearAll()
        break

      case e.key == 'x':
        cloud.changeColor('xmas')
        break

      case e.key == 'w':
        cloud.changeColor('white')
        break

      case e.key == 'm':
        cloud.dropMany()
        break


      case e.key == 'ArrowUp'    && e.shiftKey:
        cloud.upCurrent()
        break
      case e.key == 'ArrowDown'    && e.shiftKey:
        cloud.downCurrent()
        break
      case e.key == 'ArrowLeft'  && e.shiftKey:
        cloud.leftCurrent()
        break
      case e.key == 'ArrowRight' && e.shiftKey:
        cloud.rightCurrent()
        break

      case e.key == 'ArrowUp'    && !e.shiftKey:
        cloud.upAll()
        break
      case e.key == 'ArrowDown' && !e.shiftKey:
        cloud.downAll()
        break
      case e.key == 'ArrowLeft'  && !e.shiftKey:
        cloud.leftAll()
        break
      case e.key == 'ArrowRight' && !e.shiftKey:
        cloud.rightAll()
        break


      default:
        break
    }
  });
}

class Cloud {
  constructor(world) {
    this.world= world
    this.bodies = []

    this.moveScale = 20
    this.colormap = new Colormap('white')
  }

  changeColor(name) {
    this.colormap.set(name)
  }

  drop(size = 10) {
    const ww = window.innerWidth 
    const hs = size / 2
    const x = Utils.randomReal(hs, ww - hs)
    const y = 0 - size * 1.2

    const c = this.colormap.choose()
    const body = Bodies.circle(x, y, size/2, {
      restitution: 1.1,
      render: {fillStyle: c},
    });
    World.add(this.world, body)
    this.bodies.push(body)
  }

  dropMany(num = 100) {
    const slist = [
      10, 10, 10, 10, 10, 10, 
      20, 20, 20, 20, 
      40, 80, 160
    ]

    for(let i=0; i < num; ++i) {
      const s = Utils.pickup(slist)
      console.log(s)
      this.drop(s)
    }
  }

  clearAll() {
    for(let i=0; this.bodies.length; ++i) {
      const body = this.bodies.pop()
      Matter.World.remove(this.world, body)
    }
  }

  move(body, force) {
    const pos = body.position
    //Matter.Body.applyForce(body, pos, force)
    Matter.Body.setVelocity(body, force)
  }

  moveCurrent(force) {
    const c = this.current()
    if ( !c ) return

    this.move(c, force)
  }

  moveAll(force) {
    for(let i=0; this.bodies.length; ++i) {
      const b = this.bodies[i]
      this.move(b, force)
    }
  }

  upCurrent() {
    this.moveCurrent({x: 0, y: -this.moveScale})
  }

  downCurrent() {
    this.moveCurrent({x: 0, y:  this.moveScale})
  }


  leftCurrent() {
    this.moveCurrent({x: -this.moveScale, y: 0})
  }

  rightCurrent() {
    this.moveCurrent({x:  this.moveScale, y: 0})
  }

  upAll() {
    this.moveAll({x: 0, y: -this.moveScale})
  }

  downAll() {
    this.moveAll({x: 0, y:  this.moveScale})
  }

  leftAll() {
    this.moveAll({x: -this.moveScale, y: 0})
  }

  rightAll() {
    this.moveAll({x:  this.moveScale, y: 0})
  }

  current() {
    return this.bodies[this.bodies.length - 1]
  }
}

class Walls {
  constructor(world, th, w = window.innerWidth, h = window.innerHeight) {
    this.thickness = th

    this.shiftX = this.thickness / 2 + 2000
    this.world = world

    const baseW = w + this.shiftX*2 + this.thickness
    this.base  = Bodies.rectangle(            w/2, h + this.thickness/2,          baseW, this.thickness, { isStatic: true })
    this.left  = Bodies.rectangle(0 - this.shiftX,                  h/2, this.thickness,              h, { isStatic: true })
    this.right = Bodies.rectangle(w + this.shiftX,                  h/2, this.thickness,              h, { isStatic: true })

    World.add(this.world, this.array())
  }

  array() {
    return [this.base, this.left, this.right]
  }

  update(w = window.innerWidth, h = window.innerHeight) {
    const baseW = w + this.shiftX*2 + this.thickness
    Matter.Body.setPosition(this.base, {x: w/2, y: h + this.thickness/2}) 
    Matter.Body.setVertices(this.base, Matter.Vertices.fromPath(
      'L 0 0 L ' + baseW + ' 0 L ' + baseW + ' ' + this.thickness + ' L 0 ' + this.thickness 
    ))

    Matter.Body.setPosition(this.left, {x: 0 - this.shiftX, y: h/2}) 
    Matter.Body.setVertices(this.left, Matter.Vertices.fromPath(
      'L 0 0 L ' + this.thickness + ' 0 L ' + this.thickness + ' ' + h + ' L 0 ' + h 
    ))

    Matter.Body.setPosition(this.right, {x: w + this.shiftX, y: h/2}) 
    Matter.Body.setVertices(this.right, Matter.Vertices.fromPath(
      'L 0 0 L ' + this.thickness + ' 0 L ' + this.thickness + ' ' + h + ' L 0 ' + h 
    ))
  }

}

init()
