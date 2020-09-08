const messages = require('../local_modules/messages');

describe('messages.SendTestMsg', () => {
    it('should return an info object', () => {

        messages.SendTestMsg().then(info => {
            expect(info).not.toBe(null);
        });
        
    });
});