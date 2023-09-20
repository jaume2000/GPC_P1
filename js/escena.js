/**
* Escena.js
* Seminario nº2 de GPC: Pintar una escena básica con transformaciones, animación y modelos importados.
* @author <jivagri@edu.upv.es>, 2023
*/

import * as THREE from '../lib/three.module.js'
import {GLTFLoader} from "../lib/GLTFLoader.module.js"

// Variablesde consenso. SIEMPRE necesarias
let renderer, scene, camera

//Globales propias
let esferaCubo;
let angulo = 0;

//Acciones

init();
loadScene();
render();

window.onresize = (e) =>{
    camera.aspect = window.innerWidth/window.innerHeight
    renderer.setSize(window.innerWidth, window.innerHeight);
    console.log(camera.aspect)
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
    camera.lookAt(0, 1, 0)
}

function loadScene(){
    const yellow_mat = new THREE.MeshBasicMaterial({color: 'yellow', wireframe: true})
    const geoCubo = new THREE.BoxGeometry(2,2,2)
    const geoEsfera = new THREE.SphereGeometry(1,10,10)
    const cubo = new THREE.Mesh( geoCubo, yellow_mat)
    const esfera = new THREE.Mesh( geoEsfera, yellow_mat)

    esferaCubo = new THREE.Object3D()

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

function update(){
    angulo = 0.01;
    esferaCubo.rotateY(angulo);
}

function render(){
    requestAnimationFrame(render)
    update()
    renderer.render(scene, camera)
}