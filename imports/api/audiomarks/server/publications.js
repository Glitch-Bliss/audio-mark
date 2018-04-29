import { Meteor } from 'meteor/meteor';
import { Audiomarks } from '../audiomarks.js';

Meteor.publish('audiomarks.all', function () {  
  return Audiomarks.find();
});