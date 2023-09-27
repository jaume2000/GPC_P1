/**
* Escena.js
* Seminario nº2 de GPC: Pintar una escena básica con transformaciones, animación y modelos importados.
* @author <jivagri@edu.upv.es>, 2023
*/

import * as THREE from '../lib/three.module.js'
import {GLTFLoader} from "../lib/GLTFLoader.module.js"
import {OrbitControls} from '../lib/OrbitControls.module.js'

// Variablesde consenso. SIEMPRE necesarias
let renderer, scene, camera

//Globales propias
let esferaCubo;
let angulo = 0;

//Controlador de camara
let cameraControls

//Camaras adicionales
let planta, alzado, perfil
const L=5

//Acciones

init();
loadScene();
render();

function init(){

    //Motor de renderer
    renderer = new THREE.WebGLRenderer( { preserveDrawingBuffer: true } );
    renderer.autoClear = false
    renderer.setSize(window.innerWidth, window.innerHeight);
        //Añadimos el canvas de THREE JS al DOM.
    document.getElementById('container').appendChild(renderer.domElement)

    //Escena
    scene = new THREE.Scene()
    renderer.setClearColor( new THREE.Color(0,0,0.2) );

    //Camara
    const ar = window.innerWidth/window.innerHeight
    camera = new THREE.PerspectiveCamera(75, ar, 0.1, 1000)
    camera.position.set(0.5, 2, 7)
    cameraControls = new OrbitControls(camera, renderer.domElement)
    cameraControls.target.set(0,0,0)
    camera.lookAt(0, 1, 0)

    window.addEventListener('resize', updateAspectRatio)
    window.addEventListener('dblclick', rotateElement)

    setOrtographicCameras(ar)
}

function setOrtographicCameras(ar){
    let camOrto
    if(ar>1){
        camOrto = new THREE.OrthographicCamera(-L*ar, L*ar, L, -L, -100, 100)
    }
    else {
        camOrto = new THREE.OrthographicCamera(-L, L, L/ar, -L/ar, -100, 100)
    }

    alzado = camOrto.clone()
    alzado.position.set(0,0,L)
    alzado.lookAt(0,1,0)
    
    perfil = camOrto.clone()
    perfil.position.set(L,0,0)
    perfil.lookAt(0,1,0)

    planta = camOrto.clone()
    planta.position.set(0,L,0)
    planta.lookAt(0,1,0)
    planta.up = new THREE.Vector3(0,0,1)

}

function loadScene(){
    const yellow_mat = new THREE.MeshBasicMaterial({color: 'yellow', wireframe: true})
    const geoCubo = new THREE.BoxGeometry(2,2,2)
    const geoEsfera = new THREE.SphereGeometry(1,10,10)
    const cubo = new THREE.Mesh( geoCubo, yellow_mat)
    const esfera = new THREE.Mesh( geoEsfera, yellow_mat)

    esferaCubo = new THREE.Object3D()
    esferaCubo.name = 'grupoEC'

    cubo.position.set(3,0,0)
    esferaCubo.add(esfera)
    esferaCubo.add( cubo )
    esferaCubo.rotateY(3.14/4)
    scene.add( esferaCubo );
    scene.add(new THREE.AxisHelper(2))

    //Suelo

    const suelo = new THREE.Mesh(new THREE.PlaneGeometry(10,10, 10,10), yellow_mat)
    suelo.rotateX(-Math.PI/2)
    scene.add(suelo)

    //Importar un modelo JSON
    const loader = new THREE.ObjectLoader()
    loader.load('models/soldado/soldado.json', obj=>{cubo.add(obj); obj.position.set(0,1,0);})

    //Importar modelo en GLTF
    const gltfLoader = new GLTFLoader();
    gltfLoader.load('models/zorrito/zorrito.gltf', (gltf)=>{gltf.scene.position.set(0,1,0); esfera.add(gltf.scene);})

    const dir_light = new THREE.DirectionalLight(new THREE.Color(1,1,1), 1)
    const ambient_light = new THREE.AmbientLight(new THREE.Color(1,1,1), 0.2)
    scene.add(dir_light)
    scene.add(ambient_light)


}

function rotateElement(event) {
    let x = (event.clientX / window.innerWidth) * 2 -1
    let y = -(event.clientY / window.innerHeight) * 2 +1

    const rayo = new THREE.Raycaster()
    rayo.setFromCamera(new THREE.Vector2(x,y), camera)

    const intersecciones = rayo.intersectObjects(scene.getObjectByName('grupoEC').children, true)
    if( intersecciones.length > 0){
        intersecciones[0].object.rotation.y += Math.PI/8
    }
}

function updateAspectRatio() {

    renderer.setSize(window.innerWidth, window.innerHeight)
    const ar = window.innerWidth/window.innerHeight
    camera.aspect = ar
    camera.updateProjectionMatrix()
    
    if(ar>1){
        alzado.left = planta.left = perfil.left = -L*ar
        alzado.right = planta.right = perfil.right = L*ar
        alzado.top = planta.top = perfil.top = L
        alzado.bottom = planta.bottom = perfil.bottom = -L
    }
    else {
        alzado.left = planta.left = perfil.left = -L
        alzado.right = planta.right = perfil.right = L
        alzado.top = planta.top = perfil.top = L/ar
        alzado.bottom = planta.bottom = perfil.bottom = -L/ar
    }
    alzado.updateProjectionMatrix()
    planta.updateProjectionMatrix()
    perfil.updateProjectionMatrix()
}


function update(){
    esferaCubo.rotateY(angulo);
}

function render(){
    requestAnimationFrame(render)
    update()

    renderer.clear()
    //renderer.render(scene, planta)
    renderer.setViewport(0,0, window.innerWidth/2, window.innerHeight/2)
    renderer.render(scene, planta)

    renderer.setViewport(0, window.innerHeight/2, window.innerWidth/2, window.innerHeight/2)
    renderer.render(scene, alzado)
    
    renderer.setViewport(window.innerHeight/2, 0, window.innerWidth/2, window.innerHeight/2)
    renderer.render(scene, perfil)

    renderer.setViewport(window.innerWidth/2, window.innerHeight/2, window.innerWidth/2, window.innerHeight/2)
    renderer.render(scene, camera)
}