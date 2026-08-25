import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Injectable({
  providedIn: 'root',
})
export class ArquivoService {

  constructor() { }

  public async capturar(
    source: CameraSource = CameraSource.Photos
  ): Promise<File | undefined> {

    try {

      const camera = await Camera.getPhoto({
        resultType: CameraResultType.Uri,
        source,
        quality: 50,
        saveToGallery: source === CameraSource.Camera
      });

      if (!camera.webPath) {
        return;
      }

      const response = await fetch(camera.webPath);
      const blob = await response.blob();

      const extensao = camera.format || 'jpeg';

      const nomeArquivo =
        `foto-${Date.now()}.${extensao}`;

      const tipo =
        blob.type ||
        (extensao === 'png'
          ? 'image/png'
          : 'image/jpeg');

      return new File(
        [blob],
        nomeArquivo,
        { type: tipo }
      );

    } catch (erro) {

      console.error(
        'Captura cancelada ou não concluída.',
        erro
      );

      return;
    }
  }
}
