import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';

Template.player.onCreated(function playerOnCreated() {

});

Template.player.helpers({
  counter() {
    return Template.instance().counter.get();
  },
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
  'timeupdate #audio': function (e, template) { },
  'click #play_pause': function (e, template) {
    let currentState = Session.get("state") ? Session.get("state") : 0;
    if (currentState) {
      Session.set("state", 0);      
      template.find('#audio').pause();
    } else {      
      Session.set("state", 1);
      template.find('#audio').play();
    }
  }
});
