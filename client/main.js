import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Audiomarks } from '../imports/api/audiomarks/audiomarks.js'
import './main.html';

const mixTable = (commands) => {
  if (commands.ff) {
    $('#audio').get(0).currentTime += commands.ff;
  }

  if (commands.fr) {
    $('#audio').get(0).currentTime -= commands.fr;
  }
}

Template.player.onCreated(function playerOnCreated() {
  Meteor.subscribe('audiomarks.all');
  this.isStart = new ReactiveVar(false);
  this.currentMark = new ReactiveVar(null);
});

Template.player.helpers({
  markLabel() {
    return Template.instance().isStart.get() ? "Fin marque" : "Début marque";
  },
  marks() {
    return Audiomarks.find();
  },
  formattedTime(seconds) {
    var date = new Date(null);
    date.setSeconds(seconds);
    return date.getUTCHours() + 'h ' + date.getMinutes() + 'm ' + date.getSeconds() + 's';
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
  'submit #markform': function (e, template) {
    e.preventDefault();
    e.stopPropagation();

    const markform = e.currentTarget;
    let audiomark = template.currentMark.get();

    if (template.isStart && audiomark) {
      audiomark.end = $('#audio').get(0).currentTime;
      console.info(audiomark);

      Meteor.call('audiomark.upsert', audiomark, (error, result) => {
        if (error) {
          console.info(error);
        } else {
          template.currentMark.set(null);
        }
      });
    } else {
      let markObject = {};
      markObject.player = markform.player.value;
      markObject.emotion = markform.emotion.value;
      markObject.intensity = markform.intensity.value;
      markObject.start = $('#audio').get(0).currentTime;
      template.currentMark.set(markObject);
    }
  }
});

Template.player.onRendered(() => {
  var listener = new Keypress.Listener();
  listener.simple_combo("right", () => mixTable({ ff: 1 }));
  listener.simple_combo("left", () => mixTable({ fr: 1 }));
  listener.simple_combo("shift right", () => mixTable({ ff: 60 }));
  listener.simple_combo("shift left", () => mixTable({ fr: 60 }));
  listener.simple_combo("space", () => $('#audio').get(0).play());
});