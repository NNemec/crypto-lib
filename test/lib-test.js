var lib = require('../index'),
	assert = require('assert');

var lib_test = {
	aesKeysize: 128,
	rsaKeysize: 512
};

describe('Crypto Lib Api Test', function() {

	describe("Generate UUID", function() {
		it('should work', function() {
			var uuid = lib.util.UUID();
			assert.ok(uuid);
		});
	});

	describe("Generate RSA Keypair", function() {
		it('return return a valid keypair', function(done) {
			lib.rsa.generateKeypair(lib_test.rsaKeysize, function(err) {
				assert.ok(!err);
				assert.ok(lib.rsa.exportKeys().pubkeyPem);
				done();
			});
		});
	});

	describe("En/Decrypt for User", function() {
		it('return decrypt the given plaintext', function() {

			var envelopes = [];

			// package objects into batchable envelope format
			var envelope = {
				id: lib.util.UUID(),
				plaintext: 'Hello, World!',
				key: lib.util.random(lib_test.aesKeysize),
				iv: lib.util.random(lib_test.aesKeysize)
			};
			envelopes.push(envelope);

			// encrypt
			var encryptedList = lib.cryptoBatch.encryptListForUser(envelopes);
			assert.ok(encryptedList);
			assert.equal(encryptedList.length, 1);

			// decrypt
			var decryptedList = lib.cryptoBatch.decryptListForUser(encryptedList);
			assert.equal(envelopes[0].plaintext, decryptedList[0]);

		});
	});

});