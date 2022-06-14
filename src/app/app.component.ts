import { Component } from '@angular/core';
import * as OT from '@opentok/client';
import { VirtualBackgroundEffect } from '@vonage/video-effects/dist/effects/background/VirtualBackgroundEffect';
import { BackgroundEffectProcessor,  } from '@vonage/video-effects/dist/effects/BackgroundEffectProcessor';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'prueba';
  apikey = '46797564';
  sessionId =
    '2_MX40Njc5NzU2NH5-MTY1NTIxNjQ1ODQ3MX40WEYvY2pLeE9qNXU0WDZvZ3RnZDdkbUR-fg';
  token =
    'T1==cGFydG5lcl9pZD00Njc5NzU2NCZzaWc9NGYzYmRmOGI5MDI5ZjNiYzFiZDEwZjhjZmVlN2JjYmM2ODgyMGIzNjpzZXNzaW9uX2lkPTJfTVg0ME5qYzVOelUyTkg1LU1UWTFOVEl4TmpRMU9EUTNNWDQwV0VZdlkycExlRTlxTlhVMFdEWnZaM1JuWkRka2JVUi1mZyZjcmVhdGVfdGltZT0xNjU1MjE2NDU5Jm5vbmNlPTAuMzkyNTIyMzE0OTExNDM3NjMmcm9sZT1wdWJsaXNoZXImZXhwaXJlX3RpbWU9MTY1NTMwMjg1OSZpbml0aWFsX2xheW91dF9jbGFzc19saXN0PQ==';

  async loadImage():Promise<HTMLImageElement> {
    return new Promise((resolve) => {
      const image = document.createElement('img');
      image.crossOrigin = 'anonymous';
      image.src = `backgrounds/bookshelf.jpg`;
      image.onload = () => resolve(image)
    });
  }

  async getLocalMedia(): Promise<any> {
    try {
      //return await OT.getUserMedia({audioSource: null, videoSource: true});
      return await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
    } catch (err) {
      console.error('OTGetUserMedia - err', err);
    }
  }

  async createBackgroudEffectProcessor() {
    const effectProcessor = new BackgroundEffectProcessor({
      assetsPath: './assets/bookshelf.jpg',
    });
    effectProcessor.setInputStream(await this.getLocalMedia());
    return effectProcessor;
  }

  async video() {


    const effectProcessor = await this.createBackgroudEffectProcessor();
    await effectProcessor.loadEffect(
      new VirtualBackgroundEffect({
        virtualBackground: {
          backgroundType: 'image',
          backgroundImage: await this.loadImage(),
        },
      })
    );
    effectProcessor.pauseStreamProcessing(false);
    effectProcessor.enableEffect(true);
    const session = OT.initSession(this.apikey, this.sessionId);
    const publisher = OT.initPublisher('publisher', {
      videoFilter: {
        type: 'backgroundBlur',
      },
    });

    session.on({
      streamCreated: (event: any) => {
        session.subscribe(event.stream);
      },
      sessionConnected: async (event: any) => {
        session.publish(publisher);
        await publisher.applyVideoFilter({
          type: 'backgroundBlur',
          blurStrength: 'low',
        });
      },
    });

    session.connect(this.token, (error) => {
      if (error) {
        console.log(
          `There was an error connecting to the session ${error.message}`
        );
      }
    });
  }
}
