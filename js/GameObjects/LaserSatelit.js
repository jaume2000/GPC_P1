import * as THREE from '../../lib/three.module.js'

export default class LaserSatelit {
    constructor(ship,velocity, scene, instanciables, ship_distance, camera_distance, radio_planeta){
        this.velocity = velocity
        this.scene = scene
        this.instanciables = instanciables
        this.ship_distance = ship_distance
        this.camera_distance = camera_distance
        this.ship = ship

        //this.geometry = new THREE.Mesh(new THREE.SphereGeometry(50,50,planet_wires,planet_wires), new THREE.MeshBasicMaterial())
        this.center = new THREE.Object3D()
        this.geometry = new THREE.Mesh(new THREE.TorusGeometry(200, 100, 10, 30), new THREE.MeshNormalMaterial())

        this.laser = new THREE.Mesh(new THREE.CylinderGeometry(100, 10, ship_distance, 10, 10))
        this.laser.translateZ(this.ship_distance/2)
        this.laser.rotateX(Math.PI/2)
        this.geometry.add(this.laser)
        this.center.add(this.geometry)
        this.center.setRotationFromEuler(this.ship.rotation)
        
        this.scene.add(this.center)
        this.position = radio_planeta*2

        this.geometry.translateX(this.position)
        this.geometry.rotateY(Math.PI/2)

        

        instanciables.push(this)
    }

    update(delta){
        let diff_z = this.ship.rotation.z - this.center.rotation.z
        let diff_y = this.ship.rotation.y -this.center.rotation.y 

        //console.log("Z", Math.round(this.ship.rotation.z*100)/100, Math.round(this.center.rotation.z*100)/100)
        //console.log("Y", Math.round(this.ship.rotation.y*100)/100, Math.round(this.center.rotation.y*100)/100)
        //this.center.rotateZ(diff_z * delta)
        //this.center.rotateY(diff_y * delta)


        this.center.setRotationFromEuler(new THREE.Euler(this.ship.rotation.x, this.center.rotation.y + diff_y*delta, this.center.rotation.z + diff_z*delta, "XYZ"))
    }
}