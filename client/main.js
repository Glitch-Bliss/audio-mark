import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Audiomarks } from '../imports/api/audiomarks/audiomarks.js'
import './main.html';
import '../imports/startup/both';

import { $ } from 'meteor/jquery';

// Bootstrap Theme
import dataTablesBootstrap from 'datatables.net-bs';
import 'datatables.net-bs/css/dataTables.bootstrap.css';

// Buttons Core
import dataTableButtons from 'datatables.net-buttons-bs';

// Import whichever buttons you are using
import columnVisibilityButton from 'datatables.net-buttons/js/buttons.colVis.js';
import html5ExportButtons from 'datatables.net-buttons/js/buttons.html5.js';
import flashExportButtons from 'datatables.net-buttons/js/buttons.flash.js';
import printButton from 'datatables.net-buttons/js/buttons.print.js';

// Then initialize everything you imported
// dataTablesBootstrap(window, $);
dataTableButtons(window, $);
columnVisibilityButton(window, $);
html5ExportButtons(window, $);
flashExportButtons(window, $);
printButton(window, $);

const mixTable = (commands) => {
  if (commands.ff) {
    $('#audio').get(0).currentTime += commands.ff;
  }

  if (commands.fr) {
    $('#audio').get(0).currentTime -= commands.fr;
  }
}

const dateFormatter = (seconds) => {
  var date = new Date(null);
  date.setSeconds(seconds);
  return date.getUTCHours() + 'h ' + date.getMinutes() + 'm ' + date.getSeconds() + 's';
}


Template.player.onCreated(function playerOnCreated() {
  Meteor.subscribe('audiomarks.all');
  this.isStart = new ReactiveVar(false);
  this.currentMark = new ReactiveVar(null);
  this.currentFile = new ReactiveVar("/audio/part1.mp3");
  this.hadPopUpped = new ReactiveVar(false);
  this.profiler = new ReactiveVar("Laurent");
  this.start = new ReactiveVar("");
  this.end = new ReactiveVar("");
});

Template.player.helpers({
  isRecording() {
    return Template.instance().isStart.get() ? true : false;
  },
  getCurrentAudioFile() {
    return Template.instance().currentFile.get();
  },
  getHadPopUpped() {
    return Template.instance().hadPopUpped.get();
  },
  getStart() {
    return Template.instance().start.get();
  },
  getEnd() {
    return Template.instance().end.get();
  },
  getFormatted(time) {
    return dateFormatter(time);
  },
  selector() {
    return { profiler: Template.instance().profiler.get() };
  },
  getProfile() {
    return Template.instance().profiler.get();
  }
});

Template.player.events({
  'durationchange #audio': function (e, template) {
    var audio;
    audio = template.find('#audio');
    Session.set('duration', audio.duration);
  },
  'play #audio': function (e, template) {
    interval = setInterval(function () {
      var audio;
      audio = template.find('#audio');
      Session.set('currentTime', audio.currentTime);
    }, 1000); // this is faster then timeupdate but more costly for CPU
  },
  'ended #audio': function () {
    return clearInterval(interval);
  },
  'click #ff1': function (e, template) {
    mixTable({ ff: 1 });
  },
  'click #fr1': function (e, template) {
    mixTable({ fr: 1 });
  },
  'click #ff60': function (e, template) {
    mixTable({ ff: 60 });
  },
  'click #fr60': function (e, template) {
    mixTable({ fr: 65 });
  },
  'click #delete_mark': function (e, template) {
    const id = $(e.currentTarget).data('id');
    Meteor.call('audiomark.delete', id, (error, result) => {
      if (error) {
        console.info(error);
      }
    });
  },
  'click .change_audio': function (e, template) {
    const file = $(e.currentTarget).data('file');
    template.currentFile.set(file);
    $('#audio').attr('src', file);
  },
  'submit #markform': function (e, template) {
    e.preventDefault();
    e.stopPropagation();

    const markform = e.currentTarget;
    let audiomark = template.currentMark.get();

    if (template.isStart.get() && audiomark) {
      audiomark.end = $('#audio').get(0).currentTime;
      template.end.set(audiomark.end);

      Meteor.call('audiomark.upsert', audiomark, (error, result) => {
        if (error) {
          console.info(error);
        } else {
          template.currentMark.set(null);
          template.isStart.set(false);
        }
      });
    } else {
      let markObject = {};
      markObject.player = markform.player.value;
      markObject.emotion = markform.emotion.value;
      markObject.intensity = markform.intensity.value;
      markObject.start = $('#audio').get(0).currentTime;
      template.start.set(markObject.start);
      markObject.file = template.currentFile.get(0);
      markObject.isPlayer = markform.isPlayer.value;
      markObject.profiler = template.profiler.get();
      template.currentMark.set(markObject);
      template.isStart.set(true);
    }
  },
  'click #enrManualButton': function (e, template) {
    e.preventDefault();

    let start = $("#start_input").val();
    let end = $("#end_input").val();

    let markObject = {};
    markObject.player = markform.player.value;
    markObject.emotion = markform.emotion.value;
    markObject.intensity = markform.intensity.value;
    markObject.start = start;
    markObject.end = end;
    markObject.file = template.currentFile.get(0);
    markObject.isPlayer = markform.isPlayer.value;
    markObject.profiler = template.profiler.get();

    Meteor.call('audiomark.upsert', markObject, (error, result) => {
      if (error) {
        console.info(error);
      }
    });

  },
  'submit #form_choose_profile': function (e, template) {
    e.stopPropagation();
    e.preventDefault();

    template.profiler.set($("#profiles").val());    
    template.hadPopUpped.set(true);
  },
  'click tbody > tr': function (event) {
    var dataTable = $(event.target).closest('table').DataTable();
    var rowData = dataTable.row(event.currentTarget).data();
    if (!rowData) return; // Won't be data if a placeholder row is clicked
    // Your click handler logic here
    if (rowData.start) {
      $('#audio').get(0).currentTime = rowData.start;
    }
  }
});

Template.player.onRendered(() => {
  var listener = new Keypress.Listener();
  listener.simple_combo("right", () => mixTable({ ff: 1 }));
  listener.simple_combo("left", () => mixTable({ fr: 1 }));
  listener.simple_combo("shift right", () => mixTable({ ff: 60 }));
  listener.simple_combo("shift left", () => mixTable({ fr: 60 }));
  listener.simple_combo("space", () => $('#audio').get(0).paused ? $('#audio').get(0).play() : $('#audio').get(0).pause());
  listener.simple_combo("r", () => $("#markform").submit());
  listener.simple_combo("shift r", () => $("#enrManualButton").click());

  $(function () {
    $('[data-toggle="tooltip"]').tooltip()
  })
});


