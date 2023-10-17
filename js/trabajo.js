/**
* Escena.js
* Seminario nº2 de GPC: Pintar una escena básica con transformaciones, animación y modelos importados.
* @author <jivagri@edu.upv.es>, 2023
*/

import * as THREE from '../lib/three.module.js'
import {GLTFLoader} from "../lib/GLTFLoader.module.js"
import {OrbitControls} from '../lib/OrbitControls.module.js'
import {TWEEN} from "../lib/tween.module.min.js"
import Stats from '../lib/stats.module.js'
import {GUI} from "../lib/lil-gui.module.min.js"

import LinearMisil from './GameObjects/LinearMisil.js'
import LaserSatelit from './GameObjects/LaserSatelit.js'


// Constantes de escena

let radio_planeta = 1000
let earth_rotation = Math.PI/40

let moon_radius = 200
let moon_angular_velocity = Math.PI/30
let moon_rotation_velocity = 0
let planet_wires = 40

let ship_distance = 10000
let ship_eulers = [0,0,0]
let ship_euler_velocity = [0,0]
let ship_rotation = 0
let velocity = 50

let camera_distance = [200,20,0]


// Variables de consenso. SIEMPRE necesarias
let renderer, scene, camera
let clock

//Objetos estáticos de la escena
let planet, moon, moon_geometry
let ship, ship_end
let canon

// Lista de misiles
let instanciables = []
let linear_misil_time = 0
let linear_misil_velocity = 10000
let linear_misil_interval_time = 0.1

//Keyboard
let keypress_W = false
let keypress_A = false
let keypress_D = false
let keypress_S = false

//Acciones

init();
loadScene();
render();

function init(){

    clock = new THREE.Clock()

    //Motor de renderer
    renderer = new THREE.WebGLRenderer()
    renderer.autoClear = false
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.updateShadowMap.enabled = true
    document.getElementById('container').appendChild(renderer.domElement) //Añadimos el canvas de THREE JS al DOM.

    //Escena
    scene = new THREE.Scene()
    renderer.setClearColor(new THREE.Color(0,0,0.2))

    //Camara
    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 100000)
    camera.setRotationFromEuler(new THREE.Euler( ...ship_eulers, 'XYZ' ))
    camera.position.set(ship_distance + camera_distance[0], camera_distance[1] , camera_distance[2])
    camera.lookAt(0, 0, 0)

    //Monitor

    //stats = new Stats()
    //stats.setMode(0)
    //document.getElementById('container').appendChild(stats.domElement)

    //Eventos
    window.addEventListener('resize', updateAspectRatio)
    document.addEventListener('keydown', keyPressed, false)
    document.addEventListener('keyup', keyRelased, false)
}

function loadScene(){


    function createPlanetMaterial(route) {

        var earthTexture = THREE.ImageUtils.loadTexture(route);
    
        var earthMaterial = new THREE.MeshBasicMaterial();
        earthMaterial.map = earthTexture;
    
        return earthMaterial;
    }

    const light = new THREE.DirectionalLight(0xffffff, 10)

    const loader = new THREE.TextureLoader();
    const texture = loader.load(
      '/images/2k_stars_milky_way.jpg',
      () => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        texture.colorSpace = THREE.SRGBColorSpace;
        scene.background = texture;
    });



    //const default_material = new THREE.MeshBasicMaterial({color: new THREE.Color(1,0,0), wireframe: true})
    const default_material = new THREE.MeshNormalMaterial({wireframe:false, flatShading:true})
    const green_material = new THREE.MeshBasicMaterial({color: new THREE.Color(0,1,0), wireframe: true})

    let earthMaterial = createPlanetMaterial("/images/2k_earth_daymap.jpg");
    planet = new THREE.Mesh(new THREE.SphereGeometry(radio_planeta, planet_wires, planet_wires), earthMaterial)
    planet.rotateX(21/180*Math.PI)
    scene.add(planet)

    let moonMaterial = createPlanetMaterial("/images/2k_moon.jpg");
    moon = new THREE.Object3D()
    moon_geometry = new THREE.Mesh(new THREE.SphereGeometry(moon_radius, planet_wires, planet_wires), moonMaterial)
    moon_geometry.translateX(-ship_distance)
    moon.add(moon_geometry)
    scene.add(moon)

    //Línea de órbita de la luna
    /*
    let vertices = [];

    for (let i = 0; i < orbit_wires; i++) {
        const theta = (i / orbit_wires) * Math.PI * 2;
        const x = Math.cos(theta) * ship_distance;
        const z = Math.sin(theta) * ship_distance;
        vertices.push(x, 0, z);
    }
    
    vertices = new Float32Array(vertices);
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    
    // Define los índices para formar triángulos que conecten los puntos de vértice en un patrón circular
    const indices = [];
    for (let i = 0; i < orbit_wires; i++) {
        indices.push(i, (i + 1) % orbit_wires);
    }
    
    geometry.setIndex(indices);
    
    const material = new THREE.LineBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.3 });
    material.linewidth = 10;
    const circle = new THREE.LineSegments(geometry, material);
    
    // Agregar la circunferencia a la escena
    scene.add(circle);
    */

    const orbit_material = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.1 });

    const orbit = new THREE.Mesh(new THREE.TorusGeometry(ship_distance,10,10,100).rotateX(Math.PI/2), orbit_material)
    scene.add(orbit)


    //Nave espacial
    ship = new THREE.Object3D()
    ship_end = new THREE.Object3D()
    let ship_geometry = new THREE.Mesh(new THREE.BoxGeometry(5,5,5), default_material)
    ship_end.add(ship_geometry)
    ship_end.add(camera)
    ship_end.translateX(ship_distance)
    camera.position.set(camera_distance[0], camera_distance[1] , camera_distance[2])
    
    ship.add(ship_end)
    ship.setRotationFromEuler(new THREE.Euler( ...ship_eulers, 'XYZ' ))
    ship_end.setRotationFromEuler(new THREE.Euler(ship_rotation,0,0))
    
    new LaserSatelit(ship, linear_misil_velocity, scene, instanciables, ship_distance, camera_distance, radio_planeta)

    scene.add(ship)
    

}

function updateAspectRatio(){
    renderer.setSize(window.innerWidth, window.innerHeight)
    const ar = window.innerWidth/window.innerHeight
    camera.aspect = ar
    camera.updateProjectionMatrix()
}

function keyPressed(event){
    let key = event.key;
    if (key == 'w'){
        keypress_W = true
    }
    if (key == 's'){
        keypress_S = true
    }
    if (key == 'a'){
        keypress_A = true
    }
    if (key == 'd'){
        keypress_D = true
    }
    
}

function keyRelased(event){
    let key = event.key;
    if (key == 'w'){
        keypress_W = false
    }
    if (key == 's'){
        keypress_S = false
    }
    if (key == 'a'){
        keypress_A = false
    }
    if (key == 'd'){
        keypress_D = false
    }
    
}


function update(){
    let delta = clock.getDelta()
    

    if (keypress_W){
        ship_euler_velocity[1] += Math.cos(ship_rotation)*velocity/ship_distance*delta
        ship_euler_velocity[0] += -Math.sin(ship_rotation)*velocity/ship_distance*delta
    }
    if (keypress_S){
        ship_euler_velocity[1] -= 0.8*ship_euler_velocity[1]*delta
        ship_euler_velocity[0] -= 0.8*ship_euler_velocity[0]*delta

        if(Math.abs(ship_euler_velocity[0]) < 0.001 || Math.abs(ship_euler_velocity[1]) < 0.001){
            ship_euler_velocity[0] = 0
            ship_euler_velocity[1] = 0
        }
    }
    if (keypress_A){
        ship_rotation+=1*delta
    }
    if (keypress_D){
        ship_rotation-=1*delta
    }
    ship.rotateZ(ship_euler_velocity[1])
    ship.rotateY(ship_euler_velocity[0])
    moon.rotateY(moon_angular_velocity*delta)
    moon_geometry.rotateY(moon_rotation_velocity*delta)
    planet.rotateY(earth_rotation*delta)
    ship_end.setRotationFromEuler(new THREE.Euler(ship_rotation,0,0))

    instanciables.forEach(i=>i.update(delta))


    linear_misil_time+= delta
    if(linear_misil_time>linear_misil_interval_time){
        //createLinealShoot(Math.random()*Math.PI*2, Math.random()*Math.PI*2, linear_misil_velocity)
        //console.log(ship.rotation)
        //new LinearMisil(ship, linear_misil_velocity, scene, instanciables, ship_distance, camera_distance, radio_planeta)
        linear_misil_time=0
    }
}

function render(){
    requestAnimationFrame(render)
    update()

    renderer.clear()

    renderer.setViewport(0,0, window.innerWidth, window.innerHeight)
    renderer.render(scene, camera)
}




// Videogame objects

