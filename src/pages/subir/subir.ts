import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';

import { Camera, CameraOptions } from '@ionic-native/camera';
import { ImagePicker, ImagePickerOptions } from '@ionic-native/image-picker';

import { CargaArchivoProvider } from "../../providers/carga-archivo/carga-archivo";
@Component({
  selector: 'page-subir',
  templateUrl: 'subir.html',
})
export class SubirPage {
  titulo: string="";
  imagenPreview: string="";
  imagen64: string;
  constructor(private viewCtrl: ViewController, private camera: Camera, private imagePicker: ImagePicker,
    public _cap: CargaArchivoProvider) {
  }
  cerrarModal() {
    this.viewCtrl.dismiss();
  }
  mostrarCamara() {

    const options: CameraOptions = {
      quality: 50,//esto significa una calidad del 50%
      destinationType: this.camera.DestinationType.DATA_URL,
      // destinationType: this.camera.DestinationType.FILE_URI, //he cambiado esto por lo de arriba porque me daba errores
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    }

    this.camera.getPicture(options).then((imageData) => {
      // imageData is either a base64 encoded string or a file URI
      // If it's base64 (DATA_URL):
      //el formato 64 es ideal porque firebase los guarda en ese modo
      // let base64Image = 'data:image/jpeg;base64,' + imageData;
      this.imagenPreview = 'data:image/jpeg;base64,' + imageData;
      this.imagen64 = imageData;
    }, (err) => {
      // Handle error
      console.log("ERROR EN CAMARA", JSON.stringify(err));
    });
  }
  seleccionarFoto() {
    let opciones: ImagePickerOptions = {
      quality: 70,
      outputType: 1,
      maximumImagesCount: 1
    }
    this.imagePicker.getPictures(opciones).then((results) => {
      for (var i = 0; i < results.length; i++) {
        // console.log('Image URI: ' + results[i]);
        this.imagenPreview = 'data:image/jpeg;base64,' + results[i];
        this.imagen64 = results[i];

      }
    }, (err) => {
      console.log("ERROR EN selector", JSON.stringify(err));
    });
  }
  crearPost() {
    let archivo = {
      img: this.imagen64,
      titulo: this.titulo
    }
    this._cap.cargarImagenFirebase(archivo)
    // ahora con una promesa cuando se carga el archivo se va a cerrar el modal
    .then(()=>this.cerrarModal());
  }
}
