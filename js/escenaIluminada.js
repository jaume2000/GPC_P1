/**
* Escena.js
* Seminario nº2 de GPC: Pintar una escena básica con transformaciones, animación y modelos importados.
* @author <jivagri@edu.upv.es>, 2023
*/

import * as THREE from '../lib/three.module.js'
import {GLTFLoader} from "../lib/GLTFLoader.module.js"
import { OrbitControls } from '../lib/OrbitControls.module.js';
import {TWEEN} from "../lib/tween.module.min.js"
import Stats from '../lib/stats.module.js'
import {GUI} from "../lib/lil-gui.module.min.js"

// Variablesde consenso. SIEMPRE necesarias
let renderer, scene, camera

//Globales propias
let esferaCubo, cubo, suelo, esfera
let angulo = 0;
let cameraControls;
let stats;
let effectController;
let video
//Acciones

init();
loadScene();
setupGUI()
render();

window.onresize = (e) =>{
    camera.aspect = window.innerWidth/window.innerHeight
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function init(){

    //Motor de renderer
    renderer = new THREE.WebGLRenderer()
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor( new THREE.Color(0xaabbcc))
    document.getElementById('container').appendChild(renderer.domElement)
    renderer.shadowMap = true
    renderer.antialias = true


    //Escena
    scene = new THREE.Scene()
    scene.background = new THREE.Color(0,0,0.2)

    //Camara
    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000)
    camera.position.set(0.5, 2, 7)
    cameraControls = new OrbitControls(camera, renderer.domElement)
    cameraControls.target.set(0,1,0)
    camera.lookAt(0, 1, 0)

    // Luces
    const ambiental = new THREE.AmbientLight(0x222222)
    scene.add(ambiental)

    const direccional = new THREE.DirectionalLight(0xffffff, 0.5)
    direccional.position.set(-1, 1, -1)
    direccional.castShadow = true
    scene.add(direccional)

    const puntual = new THREE.PointLight(0xffffff, 0.3)
    puntual.position.set(2,7,-4)
    scene.add(puntual)

    const focal = new THREE.SpotLight('0xffffff', 0.3)
    focal.position.set(-2,7,4)
    focal.target.position.set(0,1,0)
    focal.angle = Math.PI / 7
    focal.penumbra = 0.1
    focal.castShadow = true
    scene.add(focal)
    //scene.add(new THREE.CameraHelper(focal.shadow.camera))

    //Monitor

    stats = new Stats()
    stats.setMode(0)
    document.getElementById('container').appendChild(stats.domElement)

    //Eventos
    window.addEventListener('resize', updateAspectRatio)
    renderer.domElement.addEventListener('dblclick', animate)
}

function loadScene(){
    const yellow_mat = new THREE.MeshBasicMaterial({color: 'yellow', wireframe: true})

    const texCubo = new THREE.TextureLoader().load('./images/wood512.jpg')
    const matCubo = new THREE.MeshLambertMaterial({color: 'red', map: texCubo})

    
    const entorno = ["./images/posx.jpg", "./images/negx.jpg", "./images/posy.jpg", "./images/negy.jpg", "./images/posz.jpg", "./images/negz.jpg"]
    const texEsfera = new THREE.CubeTextureLoader().load(entorno)
    const matEsfera = new THREE.MeshPhongMaterial({color: 'white', specular: 'lightblue', shininess: 30, envMap: texEsfera})

    const texSuelo = new THREE.TextureLoader().load('./images/wet_ground_512x512.jpg')
    const matSuelo = new THREE.MeshStandardMaterial({color: 'gray', map: texSuelo})


    const geoCubo = new THREE.BoxGeometry(2,2,2)
    const geoEsfera = new THREE.SphereGeometry(1,30,30)
    cubo = new THREE.Mesh( geoCubo, matCubo)
    cubo.castShadow = true
    cubo.reciveShadow = true
    esfera = new THREE.Mesh( geoEsfera, matEsfera)
    cubo.castShadow = true
    cubo.reciveShadow = true

    esferaCubo = new THREE.Object3D()

    cubo.position.set(3,0,0)
    esferaCubo.add(esfera)
    esferaCubo.add( cubo )
    esferaCubo.position.set(0,1,0)
    esferaCubo.rotateY(3.14/4)
    scene.add( esferaCubo );
    scene.add(new THREE.AxisHelper(2))

    //Suelo

    suelo = new THREE.Mesh(new THREE.PlaneGeometry(10,10, 10,10), matSuelo)
    suelo.rotateX(-Math.PI/2)
    suelo.reciveShadow = true
    scene.add(suelo)

    //Habitación
    let paredes = []
    for(let i=0; i<entorno.length; i++){
        paredes.push(new THREE.MeshBasicMaterial({side: THREE.BackSide, map: new THREE.TextureLoader().load(entorno[i])}))
    }

    const geoHabitacion = new THREE.BoxGeometry(40,40,40)
    const habitacion = new THREE.Mesh(geoHabitacion, paredes)
    scene.add(habitacion)

    //Pantalla de cine

    video = document.createElement('video');
    video.src = "./videos/Pixar.mp4"
    video.load()
    video.muted = true
    const videotextura = new THREE.VideoTexture(video)
    const matPantalla = new THREE.MeshBasicMaterial({map: videotextura, side: THREE.DoubleSide})
    const pantalla = new THREE.Mesh(new THREE.PlaneGeometry(20,6,4,4), matPantalla)
    pantalla.position.set(0,3,-6)
    scene.add(pantalla)

    
    //Importar un modelo JSON
    const loader = new THREE.ObjectLoader()
    loader.load('models/soldado/soldado.json', obj=>{
        
        obj.position.set(0,1,0);
        obj.name = "soldado"
        obj.castShadow = true
        cubo.add(obj);

        obj.material.setValues({map: new THREE.TextureLoader().load('./models/soldado/soldado.png')})
    })

    //Importar modelo en GLTF
    const gltfLoader = new GLTFLoader();
    gltfLoader.load('models/zorrito/zorrito.gltf', (gltf)=>{
        gltf.scene.position.set(0,1,0);
        gltf.scene.rotation.y = -Math.PI
        gltf.scene.name = "zorrito"
        gltf.scene.traverse(ob=>{
            if (ob.isObject3D)
            ob.castShadow = ob.reciveShadow= true})
        esfera.add(gltf.scene);
    })

}

function setupGUI() {
    effectController = {
        mensaje: 'Soldado y Robot',
        giroY: 0.0,
        separacion: 0,
        coloralambres: 'darkblue',
        silencio: true,
        play: function(){video.play()},
        pause: function(){video.pause()}
    }

    const gui = new GUI()

    const h = gui.addFolder("Carpeta 1")
    h.add(effectController, "mensaje").name("Aplicacion")
    //gui.add(effectController, "mensaje").name("Mensaje 2")

    h.add(effectController, "giroY", -180.0, 180.0, 0.025).name("Giro en Y").listen()
    h.add(effectController, "separacion",{'Ninguna': 0, 'Media': 2, 'Total':5}).name("Separación")
    h.addColor(effectController, "coloralambres").name("Color alambres")
    const videoFolder = gui.addFolder("Video control")
    videoFolder.add(effectController, "silencio").onChange(v=>{video.muted = v}).name("Mutear video")
    videoFolder.add(effectController, "play")
    videoFolder.add(effectController, "pause")
}

function updateAspectRatio(){
    renderer.setSize(window.innerWidth, window.innerHeight)
    const ar = window.innerWidth/window.innerHeight
    camera.aspect = ar
    camera.updateProjectionMatrix()
}

function animate(event){
    let x = event.clientX
    let y = event.clientY

    x = ( x / window.innerWidth) * 2-1
    y = -(y / window.innerHeight) * 2+1

    const rayo = new THREE.Raycaster()
    rayo.setFromCamera( new THREE.Vector2(x,y), camera)

    const soldado = scene.getObjectByName('soldado')
    let intersecciones = rayo.intersectObject(soldado,false)
    if ( intersecciones.length>0){
        console.log("Tocado!")
        new TWEEN.Tween(soldado.position)
        .to({x:[0,0], y:[3,1], z:[0,0]}, 1500)
        .interpolation( TWEEN.Interpolation.Bezier )
        .easing(TWEEN.Easing.Bounce.Out)
        .start()
    }


    const zorrito = scene.getObjectByName('zorrito')
    console.log(zorrito)
    intersecciones = rayo.intersectObjects(zorrito.children, true)
    console.log("Inters:", intersecciones)
    if ( intersecciones.length>0){
        console.log("Tocado!")
        new TWEEN.Tween(zorrito.rotation)
        .to({x:[0], y:[zorrito.rotation.y -Math.PI], z:[0]}, 1500)
        .interpolation( TWEEN.Interpolation.Linear )
        .easing(TWEEN.Easing.Exponential.InOut)
        .start()
    }



}

function update(delta){
    //angulo = 0.01;
    //esferaCubo.rotateY(angulo);

    /*
    TWEEN.update(delta)
    stats.update()

    cubo.position.set(1+effectController.separacion/2,0,0)
    esfera.position.set(-1-effectController.separacion/2,0,0)
    suelo.material.setValues({color: effectController.coloralambres})
    effectController.giroY = effectController.giroY + 1
    if(effectController.giroY>=180){
        effectController.giroY = effectController.giroY % 180 -180
    }
    esferaCubo.rotation.y = effectController.giroY / 180 * Math.PI
    */
}

function render(time){
    requestAnimationFrame(render)
    update()
    renderer.render(scene, camera)
}