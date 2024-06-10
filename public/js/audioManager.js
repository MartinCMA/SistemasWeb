export class AudioManager {
    constructor(uuid) {
        this.audioList = null;
        this.totalAudios = 0;
        this.uuid = uuid;
    }

    async init() {
        this.audioList = document.getElementById('audioList');
        fetch(`../api/list/${this.uuid}`)
            .then(r => r.json())
            .then(r => {console.log("Lista de grabaciones:", r);
                r.forEach(audio => {
                    this.addAudio(audio.filename, audio.date);
                });
            });
    }

    addAudio(audioId, audioDate) {
        //debugger;
        const copyIcon = document.createElement('img');
        const dateSpan = document.createElement('span');
        const deleteIcon = document.createElement('img');
        
        copyIcon.src = './images/copy.svg';
        dateSpan.innerText = moment(audioDate).calendar().toLocaleLowerCase();
        deleteIcon.src = './images/trash.svg';

        copyIcon.onclick = () => this.copyAudioUrl(audioId);
        deleteIcon.onclick = () => this.deleteAudio(audioId);
        
        const listItem = document.createElement('li');
        listItem.filename = audioId;
        listItem.appendChild(copyIcon);
        listItem.appendChild(dateSpan);
        listItem.appendChild(deleteIcon);
        //debugger;
        this.audioList.appendChild(listItem);
        this.totalAudios++;
    }

    copyAudioUrl(idAudio) {
        const url = "localhost:3000/api/play/audio/" + idAudio;
        navigator.clipboard.writeText(url).then(() => {
            Snackbar.show({
                text: 'La URL ha sido correctamente copiada al portapapeles.',
                pos: 'bottom-center',
                actionText: 'VALE',
                actionTextColor: '#F50158'
            });
        });
    }

    deleteAudio(idAudio) {
        debugger;
        fetch(`../api/delete/${this.uuid}/${idAudio}`, {method: 'POST'}).then(r => {
            console.log('Borrar audio');
        });
        var root=document.getElementById('audioList');
                while( root.firstChild ){
                  root.removeChild( root.firstChild );
                }
                // window.location.reload();
                this.init();    
    }
}
