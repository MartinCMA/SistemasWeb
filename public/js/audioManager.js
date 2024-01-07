export class AudioManager {
    constructor(uuid) {
        this.audioList = null;
        this.totalAudios = 0;
        this.uuid = uuid;
    }

    async init() {
        this.audioList = document.getElementById('audioList');
        fetch('../api/list/index.html')
            .then(response => response.json())
            .then(data => {
                data.files.forEach(audio => {
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
        deleteIcon.onclick = () => this.deleteAudioFile(audioId);
        
        const listItem = document.createElement('li');
        listItem.filename = audioId;
        listItem.appendChild(copyIcon);
        listItem.appendChild(dateSpan);
        listItem.appendChild(deleteIcon);
        //debugger;
        this.audioList.appendChild(listItem);
        this.totalAudios++;
    }

    copyAudioUrl(audioId) {
        navigator.clipboard.writeText(`/play/${audioId}`);
        Snackbar.show({ 
            text: 'Se ha copiado la URL',
            pos: 'bottom-center',
            actionText: 'OK',
            actionTextColor: '#F50158'
        });
    }

    deleteAudioFile(audioId) {
        fetch(`../api/delete/${this.uuid}/${audioId}`, {method: 'POST'}).then(r => {
            console.log('Hecha petición de borrado.');
        });
        
        var root=document.getElementById('ulAudio');
        while( root.firstChild ){
          root.removeChild( root.firstChild );
        }
        window.location.reload();
        this.audioHandler.init();  
    }
}
