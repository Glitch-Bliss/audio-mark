import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';

Template.player.onCreated(function playerOnCreated() {
  this.audioContext = new AudioContext();
  this.buffer = null;

  const audioUrl = "public/audio/part1.mp3";
  let request = new XMLHttpRequest();
  request.responseType = "arrayBuffer";
  request.addEventListener("load", () => {
    if (request.status == 200) {
      this.audioContext.decodeAudioData(request.response, (buffer) => {
        this.buffer = buffer;
      });
    }
  });

  request.open("GET", audioUrl, true);
  request.send();

});

Template.player.helpers({
  counter() {
    return Template.instance().counter.get();
  },
});

Template.player.events({
  'click #play'(event, instance) {
    console.info("Playin'");
    const sourceNode = instance.audioContext.createBufferSource();
    sourceNode.buffer = instance.buffer;
    sourceNode.connect(instance.audioContext.destination);
    sourceNode.start(0);
  },
});
