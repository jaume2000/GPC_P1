import * as THREE from '../../lib/three.module.js'

export default class LaserSatelit {

    static first_phase_time = 10
    static second_phase_time = 20

    constructor(init_eulers, ship,velocity, scene, instanciables, ship_distance, camera_distance, radio_planeta){
        this.velocity = velocity
        this.scene = scene
        this.instanciables = instanciables
        this.ship_distance = ship_distance
        this.camera_distance = camera_distance[0]
        
        this.ship = ship

        //this.geometry = new THREE.Mesh(new THREE.SphereGeometry(50,50,planet_wires,planet_wires), new THREE.MeshBasicMaterial())
        this.center = new THREE.Object3D()
        //this.geometry = new THREE.Mesh(new THREE.TorusGeometry(200, 100, 10, 30), new THREE.MeshNormalMaterial())
        this.geometry = new THREE.Object3D()

        this.laser_material = new THREE.MeshBasicMaterial({color: 0xffffff, transparent: true, opacity: 0, side: THREE.DoubleSide})

        this.laser = new THREE.Mesh(new THREE.CylinderGeometry(200, 10, ship_distance, 10, 10), this.laser_material)
        this.laser.translateZ(this.ship_distance/2)
        this.laser.rotateX(Math.PI/2)
        this.geometry.add(this.laser)
        this.center.add(this.geometry)
        this.center.setRotationFromEuler( init_eulers )
        
        this.scene.add(this.center)
        this.position = radio_planeta//*2

        this.geometry.translateX(this.position)
        this.geometry.rotateY(Math.PI/2)

        this.momentum = [0,0,0]

        this.alive = 0


        instanciables.push(this)
    }
    
    update(delta){

        this.alive+=delta

        if (this.alive < LaserSatelit.first_phase_time){

        }
        else if (this.alive < LaserSatelit.second_phase_time){
            this.laser_material.opacity = (this.alive -  LaserSatelit.first_phase_time)/LaserSatelit.second_phase_time
        }
        else{
            //Activate laser
            this.laser_material.opacity = 1
        }

        let diff_x = Math.min(Math.max(this.ship.rotation.x - this.center.rotation.x,-Math.PI), Math.PI)
        let diff_y = Math.min(Math.max(this.ship.rotation.y - this.center.rotation.y,-Math.PI), Math.PI)
        let diff_z = Math.min(Math.max(this.ship.rotation.z - this.center.rotation.z,-Math.PI), Math.PI)
        const max_momentum = 10;

        this.momentum[0] = Math.min(Math.max(this.momentum[0] + diff_x*delta*0.1, -max_momentum), max_momentum)
        this.momentum[1] = Math.min(Math.max(this.momentum[1] + diff_y*delta*0.1, -max_momentum), max_momentum)
        this.momentum[2] = Math.min(Math.max(this.momentum[2] + diff_z*delta*0.1, -max_momentum), max_momentum)

        let euler_x = this.center.rotation.x + this.momentum[0]*delta*10 + diff_x*delta
        euler_x = Math.min(Math.max(euler_x,-Math.PI), Math.PI)
        let euler_y = this.center.rotation.y + this.momentum[1]*delta*2*10 + diff_y*delta
        euler_y = Math.min(Math.max(euler_y,-Math.PI), Math.PI)
        let euler_z = this.center.rotation.z + this.momentum[2]*delta*2*10 + diff_z*delta
        euler_z = Math.min(Math.max(euler_z,-Math.PI), Math.PI)


        this.center.setRotationFromEuler(new THREE.Euler(
            euler_x,
            euler_y,
            euler_z,
            "XYZ"
            ))
    
    }
}