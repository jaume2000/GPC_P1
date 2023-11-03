import * as THREE from '../../lib/three.module.js'

export default class RandomPlanet {

    static first_phase_time = 0 //Invisibles
    static second_phase_time = 3    //Van apareciendo
    static third_phase_time = 3.1
    static final_phase_time = 4

    constructor(ship, eulers, scene, instanciables, ship_distance, camera_distance, radio_planeta){
        this.ship = ship
        this.scene = scene
        this.instanciables = instanciables
        this.ship_distance = ship_distance
        this.camera_distance = camera_distance[0]
        this.radio_planeta = radio_planeta
        

        //this.geometry = new THREE.Mesh(new THREE.SphereGeometry(50,50,planet_wires,planet_wires), new THREE.MeshBasicMaterial())
        this.center = new THREE.Object3D()
        //this.geometry = new THREE.Mesh(new THREE.TorusGeometry(200, 100, 10, 30), new THREE.MeshNormalMaterial())

        this.planet_material = new THREE.MeshBasicMaterial({color: 0xffffff, transparent: true, opacity: 1, side: THREE.DoubleSide})
        this.orbit_material = new THREE.MeshBasicMaterial({color: 0xffffff, transparent: true, opacity: 0.1, side: THREE.DoubleSide})

        this.planet = new THREE.Mesh(new THREE.SphereGeometry(radio_planeta, 40, 40), this.planet_material)
        this.orbit = new THREE.Mesh(new THREE.TorusGeometry(ship_distance,40,10,100).rotateX(Math.PI/2), this.orbit_material)
        
        this.geometry = new THREE.Object3D()
        this.geometry.add(this.planet)
        this.center.add(this.geometry)
        this.center.add(this.orbit)
        this.center.setRotationFromEuler( eulers )

        this.planet.translateX(this.ship_distance)
        


        this.scene.add(this.center)


        this.alive = 0


        instanciables.push(this)
    }
    
    update(delta){

        this.geometry.rotateY(delta)

        if(this.planet.getWorldPosition(new THREE.Vector3()).distanceTo(this.ship.getWorldPosition(new THREE.Vector3())) < this.radio_planeta){
            this.ship.gameOver()
        }
    }
}