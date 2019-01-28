import { Component } from '@angular/core';
import { ModalController } from 'ionic-angular';

import { SubirPage } from "../subir/subir";

// import { AngularFireDatabase } from '@angular/fire/database';
// import { Observable } from 'rxjs';

import { CargaArchivoProvider } from "../../providers/carga-archivo/carga-archivo";
//Pluguins
import { SocialSharing } from '@ionic-native/social-sharing';



@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  // posts: Observable<any[]>;
  hayMas: boolean = true;
  constructor(private modalCtrl: ModalController, private _cap: CargaArchivoProvider, private socialSharing: SocialSharing
    // ,  private afDB: AngularFireDatabase
  ) {
    // this.posts = this.afDB.list('post').valueChanges();
  }


  mostrarModal() {
    let modal = this.modalCtrl.create(SubirPage);
    modal.present();
  }
  doInfinite(infiniteScroll) {
    console.log('Begin async operation');
    this._cap.cargarImagenes().then(
      (hayMas: boolean) => {
        console.log(hayMas);
        this.hayMas = hayMas;
        infiniteScroll.complete();
      }
    );
  }
  compartir(post: any) {
    console.log(post.titulo);
    console.log(post.img);
    this.socialSharing.shareViaFacebook(post.titulo, null, post.img)
    .then(()=>{})//se pudo compartir
    .catch(()=>{})//si sucede algun error
  }
}
