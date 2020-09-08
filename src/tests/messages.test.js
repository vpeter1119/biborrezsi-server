const messages = require('../local_modules/messages');

describe('messages.SendTestMsg', () => {
    it('should return an info object with a non-empty accepted property', () => {

        messages.SendTestMsg().then(info => {
            expect(info.accepted).not.toBe(false);
        });
        
    });
});