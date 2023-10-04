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
    renderer.setSize(window.innerWidth, window.innerHeight);
        //Añadimos el canvas de THREE JS al DOM.
    document.getElementById('container').appendChild(renderer.domElement)

    //Escena
    scene = new THREE.Scene()
    scene.background = new THREE.Color(0,0,0.2)

    //Camara
    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000)
    camera.position.set(0.5, 2, 7)
    cameraControls = new OrbitControls(camera, renderer.domElement)
    cameraControls.target.set(0,1,0)
    camera.lookAt(0, 1, 0)

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
    const geoCubo = new THREE.BoxGeometry(2,2,2)
    const geoEsfera = new THREE.SphereGeometry(1,10,10)
    cubo = new THREE.Mesh( geoCubo, yellow_mat)
    esfera = new THREE.Mesh( geoEsfera, yellow_mat)

    esferaCubo = new THREE.Object3D()

    cubo.position.set(3,0,0)
    esferaCubo.add(esfera)
    esferaCubo.add( cubo )
    esferaCubo.rotateY(3.14/4)
    scene.add( esferaCubo );
    scene.add(new THREE.AxisHelper(2))

    //Suelo

    suelo = new THREE.Mesh(new THREE.PlaneGeometry(10,10, 10,10), yellow_mat)
    suelo.rotateX(-Math.PI/2)
    scene.add(suelo)

    //Importar un modelo JSON
    const loader = new THREE.ObjectLoader()
    loader.load('models/soldado/soldado.json', obj=>{
        
        obj.position.set(0,1,0);
        obj.name = "soldado"

        cubo.add(obj);
    })

    //Importar modelo en GLTF
    const gltfLoader = new GLTFLoader();
    gltfLoader.load('models/zorrito/zorrito.gltf', (gltf)=>{
        gltf.scene.position.set(0,1,0);
        gltf.scene.rotation.y = -Math.PI
        gltf.scene.name = "zorrito"
        esfera.add(gltf.scene);
    })

    const dir_light = new THREE.DirectionalLight(new THREE.Color(1,1,1), 1)
    const ambient_light = new THREE.AmbientLight(new THREE.Color(1,1,1), 0.2)
    scene.add(dir_light)
    scene.add(ambient_light)


}

function setupGUI() {
    effectController = {
        mensaje: 'Soldado y Robot',
        giroY: 0.0,
        separacion: 0,
        coloralambres: 'darkblue',

    }

    const gui = new GUI()

    const h = gui.addFolder("Carpeta 1")
    h.add(effectController, "mensaje").name("Aplicacion")
    //gui.add(effectController, "mensaje").name("Mensaje 2")

    h.add(effectController, "giroY", -180.0, 180.0, 0.025).name("Giro en Y").listen()
    h.add(effectController, "separacion",{'Ninguna': 0, 'Media': 2, 'Total':5}).name("Separación")
    h.addColor(effectController, "coloralambres").name("Color alambres")
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
}

function render(time){
    requestAnimationFrame(render)
    update()
    renderer.render(scene, camera)
}