
var itemDefaults = {
  tric: {
    filename: 'tricycle.babylon',
    name: "Tricycle",
    url: "https://clara.io/view/f7aa9991-22b9-4198-a1b6-fc7f91540cff",
    scale: {
      x: 2.75,
      y: 2.75,
      z: 2.75
    },
    rotate: {
      x: 0,
      y: Math.PI,
      z: 0
    },
    removeMeshes: ["Plane"]
  },
  "the-hunted": {
    filename: 'the-hunted.babylon',
    name: "the-hunted",
    url: "https://clara.io/view/2631f69d-69be-43d2-bf6c-605974b65e12",
    scale: {
      x: 0.87,
      y: 0.87,
      z: 0.87
    },
    rotate: {
      x: 0,
      y: Math.PI,
      z: 0
    },
    removeMeshes: []
  },
  viper: {
    filename: 'dodge-viper-gts.babylon',
    name: "Dodge Viper",
    url: "https://clara.io/view/ea3c4c3c-151c-44ce-ab74-0f623d66e995",
    scale: {
      x: 0.57,
      y: 0.57,
      z: 0.57
    },
    rotate: {
      x: 0,
      y: Math.PI,
      z: 0
    },
    removeMeshes: ["Plane"]
  },
  mustang: {
    filename: '1967-shelby-ford-mustang.babylon',
    name: "'67 Mustang",
    url: "https://clara.io/view/790976e3-f99c-4f34-b475-f83fa14693b8",
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    rotate: {
      x: 0,
      y: 0,
      z: 0
    },
    removeMeshes: ["Plane"]
  },
  lambo: {
    filename: 'lamborghini-aventador-pbribl.babylon',
    name: "Lambo",
    url: "https://clara.io/view/96faa288-fc45-4f7b-963d-4ff1da9ea8a1",
    scale: {
      x: 1.75,
      y: 1.75,
      z: 1.75
    },
    rotate: {
      x: 0,
      y: Math.PI / 2,
      z: 0
    },
    removeMeshes: ["Plane", "Cylinder1"]
  }
};

// amount is 0 to 1
var slide = function (from, to, amount) {
  return ((to - from) * amount) + from;
};

function MyGame ( canvasEl, callbacks ) {
  this.callbacks = callbacks || {};
  this.selectedItem = null;
  this.renderCount = 0;

  this.itemDefaults = itemDefaults;

  this.hoverItem = null;
  this.curMousePos = {
    x: -1,
    y: -1
  };
  this.mousemoveLastMousePos = {
    x: -1,
    y: -1
  };

  this.pickingPredicate = function ( mesh ) {
    return true; //mesh.name !== "ground1";
  };


  /* Spawning / removal functions */

  this.removeMesh = function (mesh) {
    while (mesh.parent) {
      mesh = mesh.parent;
    }
    mesh.dispose();
  };

  this.applyItemDefaults = function (folder, rootMesh, allMeshes) {
    var defaults = this.itemDefaults[folder];
    if (!defaults) {
      return;
    }

    var x, y, z;
    x = defaults.scale.x;
    y = defaults.scale.y;
    z = defaults.scale.z;
    rootMesh.scaling.copyFromFloats(x, y, z);

    x = defaults.rotate.x;
    y = defaults.rotate.y;
    z = defaults.rotate.z;
    rootMesh.rotation.copyFromFloats(x, y, z);

    //rootMesh.position.y = -2;

    var id = "";
    var rm = defaults.removeMeshes;
    for (var i = 0; i < rm.length; i++) {
      id = rm[i];
      for (var x = 0; x < allMeshes.length; x++) {
        if (allMeshes[x].id === id) {
          allMeshes[x].dispose();
          break;
        }
      }
    }
  };

  this.wrapMeshesInRootContainer = function ( name, meshes ) {
    var container = new BABYLON.Mesh( name, this.scene );
    var ids = {};

    for ( let i = 0; i < meshes.length; i++ ) {
      let mesh = meshes[i];
      let parent = mesh.parent || mesh;
      while ( parent.parent && parent.parent !== container ) {
        parent = parent.parent;
      }
      if ( !ids[ parent.id ] ) {
        ids[ parent.id ] = true;
        parent.parent = container;
      }
    }

    return container;
  };

  this.spawnModel = function ( folder, filename ) {
    var vm = this;

    // Params: meshesNames, rootUrl, sceneFilename, scene, onsuccess, progressCallBack, onerror
    BABYLON.SceneLoader.ImportMesh(
      "",
      "/3d_models/" + folder + "/",
      filename,
      this.scene,
      function ( meshes ) {
        console.log("Spawned successfully", arguments);

        var rootMesh = vm.wrapMeshesInRootContainer( filename + Math.random(), meshes );

        vm.applyItemDefaults(folder, rootMesh, meshes);

        vm.selectedItem = rootMesh;
      },
      function () {
        console.log("Spawn Progress", arguments);
      },
      function () {
        console.log("Spawn failed", arguments);
      }
    );
  };

  /* Control functions */

  this.everyFrame = function () {
    var fastCheck = false;
    var picked = this.scene.pick( this.curMousePos.x, this.curMousePos.y, this.pickingPredicate, fastCheck ) || {};

    this.hoverItem = picked.pickedMesh;
  };

  /* Setup functions */

  this.mainRenderLoop = function () {
    var engine = this.engine;
    engine.runRenderLoop(() => {
      // Current frames per second
      this.fpsCounter = engine.getFps().toFixed();
      // Milliseconds since last frame render
      this.deltaTime = engine.deltaTime;
      // just a var that changes every frame
      this.renderCount = ( this.renderCount + 1 ) % 100;

      this.scene.render();

      this.everyFrame();

      this.callbacks.mainRenderLoop && this.callbacks.mainRenderLoop.call(this);
    });
  };

  this.initScene = function () {
    var scene = new BABYLON.Scene( this.engine );
    scene.clearColor = new BABYLON.Color4( 0.25, 0.25, 0.25, 0 );
    scene.ambientColor = new BABYLON.Color3( 0.85, 0.85, 0.85 );

    // disable things we aren't using
    scene.probesEnabled = false;
    scene.proceduralTexturesEnabled = false;
    scene.skeletonsEnabled = false;
    scene.spritesEnabled = false;
    scene.particlesEnabled = false;
    scene.lensFlaresEnabled = false;
    scene.fogEnabled = false;

    this.scene = scene;

    return scene;
  };

  this.initCamera = function () {

    //var initialRotationAroundYAxis = BABYLON.Tools.ToRadians( 0 );
    //var initialRotationAroundXAxis = BABYLON.Tools.ToRadians( -90 );
    //var initialRadius = 10;
    //var initialLookAtTarget = new BABYLON.Vector3( 0, 2, 0 );
    ////var initialLookAtTarget = new BABYLON.Vector3( 0, 2, 0 );
    //var camera = new BABYLON.ArcRotateCamera(
    //  "camera1",
    //  initialRotationAroundYAxis,
    //  initialRotationAroundXAxis,
    //  initialRadius,
    //  initialLookAtTarget,
    //  this.scene
    //);

    var camera = new BABYLON.TargetCamera( "camera1", new BABYLON.Vector3( -5.5, 6.67, 7.5 ), this.scene );
    camera.setTarget( new BABYLON.Vector3( 0, 1.25, 0 ) );
    camera.attachControl( this.canvas, false );

    this.camera = camera;

    return camera;
  };

  this.addStuffToScene = function () {
    var light = new BABYLON.HemisphericLight( "light1", new BABYLON.Vector3(0, 1, 0), this.scene );
    //light.groundColor = new BABYLON.Color3( 1, 1, 1 );
    light.intensity = 0.5;
  };

  this.addEvents = function () {
    var vm = this;

    // animate header
    var animation = 2;

    $(window).on("scroll", function ( $ev ) {
      var amount = window.scrollY / $(".header")[0].offsetHeight;
      amount *= 2.5; // do it faster
      if ( amount > 1.125 ) {
        return;
      }
      var cam = vm.camera;
      var camX, camY, camZ, targetX, targetY, targetZ;
      if ( animation === 1 ) {
        // Just Y changes (like the page)
        camX = -8;
        camY = slide( 6.5, 1, amount );
        camZ = 8.75;
        targetY = slide( 1.25, 4.25, amount );

      } else if ( animation === 2 ) {
        // Y changes + zoom-out effect
        camX = slide( -5.125, -8, amount );
        camY = slide( 6.5, 1, amount );
        camZ = slide( 7.5, 8.75, amount );
        targetY = slide( 1.25, 4.25, amount );

      } else if ( animation === 3 ) {
        // camera sweeps down and to the right
        camX = slide( -5.5, -10, amount );
        camY = slide( 6.67, 1.5, amount );
        camZ = slide( 7.5, 3.5, amount );
        targetY = slide( 1.25, 3.75, amount );
      }
      targetX = 0;
      targetZ = 0;
      //console.log( camX, camY, targetY );

      cam.position.copyFromFloats( camX, camY, camZ );
      cam.setTarget( new BABYLON.Vector3( targetX, targetY, targetZ ) );
    });

    $(document).on("mousemove", function ( $ev ) {
      var touches = $ev.touches || ($ev.originalEvent && $ev.originalEvent.touches);
      var pageX = $ev.pageX || touches && touches[ 0 ] && touches[ 0 ].pageX || 0;
      var pageY = $ev.pageY || touches && touches[ 0 ] && touches[ 0 ].pageY || 0;

      vm.mousemoveLastMousePos.x = vm.curMousePos.x;
      vm.mousemoveLastMousePos.y = vm.curMousePos.y;

      vm.curMousePos.x = pageX;
      vm.curMousePos.y = pageY;
    });
  };

  this.init = function ( canvasEl ) {
    var vm = this;

    var antialiasing = true;
    var adaptToDeviceRatio = true;
    var options = {
      stencil: true
    };
    var engine = new BABYLON.Engine( canvasEl, antialiasing, options, true );

    vm.canvas = canvasEl;
    vm.engine = engine;

    vm.initScene();

    vm.initCamera();

    vm.addStuffToScene();

    this.addEvents();

    vm.mainRenderLoop();

    return vm;
  };

  return this.init( canvasEl );
};
