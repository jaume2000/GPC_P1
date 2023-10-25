import * as THREE from '../../lib/three.module.js'

export default class StaticLaser {

    static first_phase_time = 0 //Invisibles
    static second_phase_time = 0.5    //Van apareciendo
    static third_phase_time = 1.5
    static final_phase_time = 2

    constructor(ship, eulers, scene, instanciables, ship_distance, camera_distance, radio_planeta){
        this.ship = ship
        this.scene = scene
        this.instanciables = instanciables
        this.ship_distance = ship_distance
        this.camera_distance = camera_distance[0]
        

        //this.geometry = new THREE.Mesh(new THREE.SphereGeometry(50,50,planet_wires,planet_wires), new THREE.MeshBasicMaterial())
        this.center = new THREE.Object3D()
        this.ship_collision_point = new THREE.Object3D()
        //this.geometry = new THREE.Mesh(new THREE.TorusGeometry(200, 100, 10, 30), new THREE.MeshNormalMaterial())

        this.laser_material = new THREE.MeshBasicMaterial({color: 0xffffff, transparent: true, opacity: 0, side: THREE.DoubleSide})

        this.laser = new THREE.Mesh(new THREE.CylinderGeometry(1000, 10, this.ship_distance*2, 10, 10), this.laser_material)
        
        this.laser.rotateZ(-Math.PI/2)
        this.center.add(this.laser)
        this.center.add(this.ship_collision_point)
        this.ship_collision_point.position.set(ship_distance,0,0)
        this.center.setRotationFromEuler( eulers )
        
        this.scene.add(this.center)

        this.laser.translateY(radio_planeta + this.ship_distance)

        this.alive = 0

        this.ship_collision_point.updateMatrixWorld()
        instanciables.push(this)
    }
    
    update(delta){

        this.alive+=delta

        if (this.alive < StaticLaser.first_phase_time){

        }
        else if (this.alive < StaticLaser.second_phase_time){
            //max opacity = 0.1
            this.laser_material.opacity = (this.alive -  StaticLaser.first_phase_time)/(StaticLaser.second_phase_time)*0.1
            
        }
        else if (this.alive < StaticLaser.third_phase_time){
            //Activate laser
            this.laser_material.opacity = 1
            if(this.ship_collision_point.getWorldPosition(new THREE.Vector3()).distanceTo(this.ship.getWorldPosition(new THREE.Vector3())) < 350){
                this.ship.gameOver()
            }
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
            this.center.remove(this.laser)   
            this.scene.remove( this.laser )
            this.scene.remove( this.center )
        }
    
    }
}