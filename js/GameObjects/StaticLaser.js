import * as THREE from '../../lib/three.module.js'

export default class StaticLaser {

    static first_phase_time = 0
    static second_phase_time = 3
    static third_phase_time = 4
    static final_phase_time = 5

    constructor(ship, scene, instanciables, ship_distance, camera_distance, radio_planeta){
        this.scene = scene
        this.instanciables = instanciables
        this.ship_distance = ship_distance
        this.camera_distance = camera_distance[0]
        
        this.ship = ship

        //this.geometry = new THREE.Mesh(new THREE.SphereGeometry(50,50,planet_wires,planet_wires), new THREE.MeshBasicMaterial())
        this.center = new THREE.Object3D()
        //this.geometry = new THREE.Mesh(new THREE.TorusGeometry(200, 100, 10, 30), new THREE.MeshNormalMaterial())

        this.laser_material = new THREE.MeshBasicMaterial({color: 0xffffff, transparent: true, opacity: 0})

        this.laser = new THREE.Mesh(new THREE.CylinderGeometry(200, 10, this.ship_distance, 10, 10), this.laser_material)
        //this.laser.translateZ(this.ship_distance/2)
        this.laser.rotateZ(-Math.PI/2)
        this.center.add(this.laser)
        this.center.setRotationFromEuler( ship.rotation )
        
        this.scene.add(this.center)

        this.laser.translateY(radio_planeta + this.ship_distance/2)

        this.alive = 0


        instanciables.push(this)
    }
    
    update(delta){

        this.alive+=delta

        if (this.alive < StaticLaser.first_phase_time){

        }
        else if (this.alive < StaticLaser.second_phase_time){
            this.laser_material.opacity = (this.alive -  StaticLaser.first_phase_time)/StaticLaser.second_phase_time
        }
        else if (this.alive < StaticLaser.third_phase_time){
            //Activate laser
            this.opacity = 1
        }
        else if (this.alive < StaticLaser.final_phase_time){
            this.laser_material.opacity = Math.max(StaticLaser.final_phase_time-this.alive,0)/(StaticLaser.final_phase_time - StaticLaser.third_phase_time)
        }
        else{
            this.opacity=0.1
            const indiceObjetoAEliminar = this.instanciables.indexOf(this);

            if (indiceObjetoAEliminar !== -1) {
                this.instanciables.splice(indiceObjetoAEliminar, 1);
            }        
            this.center.remove(this.geometry)   
            this.scene.remove( this.geometry )
            this.scene.remove( this.center )
        }
    
    }
}