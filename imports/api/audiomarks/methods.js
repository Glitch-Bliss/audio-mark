import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Audiomarks } from './audiomarks.js';

Meteor.methods({
    'audiomark.upsert'(audiomark) {
        
        return Audiomarks.upsert({ _id: audiomark.id }, {
            $set: {
                emotion: audiomark.emotion,
                player: audiomark.player,
                intensity: audiomark.intensity,
                start: audiomark.start,
                end: audiomark.end,
                isCharacter: audiomark.isCharacter,                                                
                createdAt: new Date()
            }
        });
    },
    'audiomark.delete'(id) {
        check(id, String);
        return Audiomarks.remove(id);
    }
});