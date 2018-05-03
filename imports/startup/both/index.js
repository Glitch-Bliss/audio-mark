import Tabular from 'meteor/aldeed:tabular';
import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { Audiomarks } from '../../api/audiomarks/audiomarks.js'

const dateFormatter = (seconds) => {
    var date = new Date(null);
    date.setSeconds(seconds);
    return date.getUTCHours() + 'h ' + date.getMinutes() + 'm ' + date.getSeconds() + 's';
}

new Tabular.Table({
    name: "Marques",
    collection: Audiomarks,
    dom: 'Bfrtip',
    buttons: ['copy', 'excel', 'csv'],    
    info:true,    
    columns: [
        {
            title: 'Joueur',
            data: 'player', // note: access nested data like this            
            className: 'playerColumn'
        },
        {
            title: 'In persona?',
            data: 'isPlayer', // note: access nested data like this
            render: (cellData, renderType, currentRow) => eval(cellData) ? 'Non' : 'Oui',
            className: 'inPColumn'
        },
        {
            title: 'Emotion',
            data: 'emotion', // note: access nested data like this
            className: 'emotionColumn'
        },
        {
            title: 'Intensité',
            data: 'intensity', // note: access nested data like this
            className: 'intensityColumn'
        },
        {
            title: 'Début',
            data: 'start', // note: access nested data like this
            render: (cellData, renderType, currentRow) => dateFormatter(cellData),
            className: 'startColumn'
        },
        {
            title: 'Fin',
            data: 'end', // note: access nested data like this
            render: (cellData, renderType, currentRow) => dateFormatter(cellData),
            className: 'endColumn'
        },
        {
            title: 'Fichier',
            data: 'file', // note: access nested data like this
            className: 'fileColumn'
        },
        {
            title: '',
            render: (cellData, renderType, currentRow) => {
                let button = '<button class="btn btn-danger" data-id="' + currentRow._id + '" id="delete_mark" type="submit"><i class="fa fa-trash"></i></button>';
                return button;
            },
            className: 'deleteColumn'
        }
    ]
});