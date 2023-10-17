import * as THREE from '../../lib/three.module.js'

export default class LinearMisil {
    constructor(eulers, velocity, scene, instanciables, ship_distance, camera_distance, radio_planeta){
        this.velocity = velocity
        this.scene = scene
        this.instanciables = instanciables
        this.ship_distance = ship_distance
        this.camera_distance = camera_distance[0]


        //this.geometry = new THREE.Mesh(new THREE.SphereGeometry(50,50,planet_wires,planet_wires), new THREE.MeshBasicMaterial())
        this.center = new THREE.Object3D()
        this.geometry = new THREE.Mesh(new THREE.BoxGeometry(50,50,50), new THREE.MeshBasicMaterial())
        this.center.add(this.geometry)
        this.center.setRotationFromEuler(eulers)
        this.scene.add(this.center)
        this.position = radio_planeta
        this.geometry.translateX(this.position)

        instanciables.push(this)
    }

    update(delta){
        
        /*
        this.geometry.scale.x = (this.position/ship_distance)*10
        this.geometry.scale.y = (this.position/ship_distance)*10
        this.geometry.scale.z = (this.position/ship_distance)*10
        */

        if(this.position > this.ship_distance + this.camera_distance){
            
            const indiceObjetoAEliminar = this.instanciables.indexOf(this);

            if (indiceObjetoAEliminar !== -1) {
                this.instanciables.splice(indiceObjetoAEliminar, 1);
            }        
            this.center.remove(this.geometry)   
            this.scene.remove( this.geometry )
            this.scene.remove( this.center )

        }
        else{
            this.position+=this.velocity*delta
            this.geometry.position.set(this.position,0,0)
        }
    }
}