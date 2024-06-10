
// PS C:\SW\practica\notas-voz> git push -u origin master
// remote: Permission to MartinCartajena/SistemasWeb.git denied to MartinCMA.
// fatal: unable to access 'https://github.com/MartinCartajena/SistemasWeb.git/': The requested URL returned error: 403


import { recordFn } from "/js/recordButton.js";
import { playFn } from "/js/playButton.js";
import { uploadFn } from "/js/uploadButton.js"
import { AudioManager } from "/js/audioManager.js";
import v4 from '../utils/uuid/v4.js';


class App {
  constructor() {
    this.audio = new Audio();
    this.blob = new Blob(this.audioChunks, { type: 'audio/ogg' });;
    this.state = {};
    this.audioManager = null;
    this.recordButton = null; 
    this.playButton = null; 
    this.uploadButton = null; 
    
  }

  init() {

    window.onload = async () => {
      //debugger;

      // const buttonsContainer = document.getElementById("buttonsContainer");
      // buttonsContainer.innerHTML = recordFn() + playFn() + uploadFn();

      const liPlayButton = document.getElementById('liPlayButton');
      const liRecordButton = document.getElementById('liRecordButton');
      const liUploadButton = document.getElementById('liUploadButton');
      this.recordButton = recordFn();
      this.playButton = playFn();
      this.uploadButton = uploadFn();
      this.uploadButton.onclick = () => this.uploadAudio();
      liRecordButton.appendChild(this.recordButton);
      liPlayButton.appendChild(this.playButton);
      liUploadButton.appendChild(this.uploadButton);
      if (!localStorage.getItem('uuid')) localStorage.setItem('uuid', v4());
      this.uuid = localStorage.getItem('uuid'); 
      this.audioManager = new AudioManager(this.uuid);
      this.audioManager.init();

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      this.initAudio();
      this.initRecord(stream);

      // fetch("/api/list")
      //     .then((res) => res.json())
      //     .then((json) => {
      //       console.log(json);
      //     })
      //     .catch((err) => console.error('Error al obtener la lista de archivos:', err));

      this.setState({ isRecording: false, isPlaying: false, recordCache: false });
    };

    logout_m();
   
  }
  

  initAudio() {
    this.audio.hidden = true;
    document.body.appendChild(this.audio);

    this.audio.onloadedmetadata = () => console.log('Metadatos del audio cargados.');

    this.audio.ondurationchange = () => {
            console.log('Duración del audio cambiada.');
            this.setState();
        }
    this.audio.ontimeupdate = () => {
            console.log('Tiempo de reproducción actualizado.');
            this.setState();
        }
    this.audio.onended = () => {
            console.log('Reproducción del audio finalizada.');
            this.stopAudio();
        };
  }

  initRecord(stream) {
    // const mediaRecorder = new MediaRecorder(stream);

    // mediaRecorder.ondataavailable = (event) => {
    //   if (event.data.size > 0) {
    //     this.blob = new Blob([event.data], { type: 'audio/wav' });
    //     this.loadBlob();
    //   }
    // };

    // mediaRecorder.onstop = () => {
    //   this.setState({ recordings: false });
    // };

    // this.setState({ mediaRecorder, stream });

    this.mediaRecorder = new MediaRecorder(stream);
    this.mediaRecorder.ondataavailable = event =>  this.audioChunks.push(event.data);
    this.mediaRecorder.onstop = () => this.loadBlob();
  }

  loadBlob() {
    this.blob = new Blob(this.audioChunks, { type: 'audio/ogg' });
    this.audio.src = URL.createObjectURL(this.blob);
  }

  record() {
    this.audioChunks = [];
    this.loadBlob();
    this.mediaRecorder.start();
    this.setState({ isRecording: true });
    this.recordingTime = MAX_RECORD_TIME;
    this.recordingInterval = setInterval(() => {
        this.recordingTime--;
        if(this.recordingTime <= 0) {
            this.stopRecording();
        } else {
            this.setState();
        }
    }, 1000);
  }

  stopRecording() {
    this.mediaRecorder.stop();
    clearInterval(this.recordingInterval);
    this.recordingTime = MAX_RECORD_TIME;
    this.setState({ isRecording: false, recordCache: true });
  }

  playAudio() {
    this.audio.play();
    this.setState({ isPlaying: true });
  }

  stopAudio() {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.setState({ isPlaying: false });
  }

  setState(state) {
    this.state = Object.assign({}, this.state, state);
    this.render();
  }

  render() {
    let isRecording = this.state.isRecording;
    let isPlaying = this.state.isPlaying;
    if(isRecording && isPlaying){
        this.setState({ isPlaying: false });
        return;
    }
    //debugger;
    let recordTime = this.toMinSeconds(this.recordingTime);
    let playTime = this.toMinSeconds(this.audio.duration - this.audio.currentTime || 0);
    let duration = this.toMinSeconds(this.audio.duration || 0);
    if(this.state.isRecording) {
        this.playButton.disabled = true;
        this.uploadButton.disabled = true;
        this.recordButton.children[1].innerText = `Parar (${recordTime})`;
        this.recordButton.onclick = () => this.stopRecording();
        this.recordButton.children[0].src = './images/stop.svg';
    } else {  
        if(this.state.recordCache){
            this.playButton.disabled = false;
            this.uploadButton.disabled = false;
            this.recordButton.children[0].src = './images/arrow-clockwise.svg';
        }
        //debugger;
        this.recordButton.children[1].innerText = `Grabar (${recordTime})`;
        this.recordButton.onclick = () => this.record();
    }
    if(this.state.isPlaying) {
        this.playButton.children[1].innerText = `Parar (${playTime})`;
        this.playButton.onclick = () => this.stopAudio();
        this.playButton.children[0].src = './images/stop.svg';
    } else {
        this.playButton.children[1].innerText = `Escuchar (${duration})`;
        this.playButton.onclick = () => this.playAudio();
        this.playButton.children[0].src = './images/play.svg';
    }
  }

  toMinSeconds(time){
      let minutes = Math.floor(time/60);
      let seconds = ("0" + (Math.floor(time)%60)).slice(-2);
      
      return `${minutes}:${seconds}`;
  }

  async uploadAudio() {

    // fetch(`/api/upload/${this.uuid}`,
    // {
    //     method: 'POST',
    //     body: this.blob
    // });

    debugger;
    const formData = new FormData();
    formData.append('recordings', this.blob);
    await fetch(`/api/upload/${this.uuid}`, { method: 'POST', body: formData });
    var root = document.getElementById('audioList');
    while (root.firstChild) {
        root.removeChild(root.firstChild);
    }
    this.audioManager.init();

    // this.setState({ uploading: true });
    // const body = new FormData();
    // body.append("recordings", this.blob);
    // fetch("/api/upload/" + this.uuid, {
    //   method: "POST",
    //   body,
    // })
    //   .then((res) => res.json())
    //   .then((json) => {
    //     debugger;
    //     console.log("Se ha conseguido recibir el json", json);
    //     this.audioManager.init();
    //   })
    //   .catch((err) => {
    //     debugger;
    //     this.setState({ error: true });
    //   });
  }

}




function logout_m() {
  const btnLogout = document.getElementById("logout");

  const handleResponse = (response) => {
      if (response.success) {
          window.location.href = "/logout";
      } else {
          console.log('Error al cerrar sesión');
          const text = document.createElement('span');
          text.innerText = 'Error al cerrar sesión';
          document.body.appendChild(text);
      }
  };

  btnLogout.onclick = () => {
    debugger;
    fetch("/login", {
      method: 'POST',
      redirect: 'follow',
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
      },
      body:JSON.stringify({ name: 'null'})
    }).then(r=>{window.location.href = "/logout"  })
  };

}


const MAX_RECORD_TIME = 300;
const myApp = new App();
myApp.init();
