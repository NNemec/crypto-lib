'use strict';

function doTests(assert, lib) {

	var libTest = {
		aesKeysize: 128,
		rsaKeysize: 512
	};

	describe('Crypto Lib Api Test', function() {
		this.timeout(20000);

		describe("Generate RSA Keypair", function() {
			it('return return a valid keypair', function(done) {
				lib.rsa.generateKeypair(libTest.rsaKeysize, function(err, keypair) {
					assert.ok(!err);
					assert.ok(keypair.pubkeyPem);
					done();
				});
			});
		});

		describe("En/Decrypt item for User", function() {
			it('return decrypt the given plaintext', function() {

				var msg = 'Hello, World!',
					exported = lib.rsa.exportKeys();

				// package into batchable envelope for encryption
				var envelope = {
					id: lib.util.UUID(),
					plaintext: msg,
					key: lib.util.random(libTest.aesKeysize),
					iv: lib.util.random(libTest.aesKeysize),
					receiverPk: exported._id
				};

				// encrypt
				var encryptedItem = lib.cryptoBatch.encryptItemForUser(envelope, exported.pubkeyPem, exported._id);
				assert.ok(envelope.ciphertext);

				// decrypt
				var decryptedItem = lib.cryptoBatch.decryptItemForUser(encryptedItem, exported.pubkeyPem, exported._id);
				assert.equal(msg, decryptedItem.plaintext);

			});
		});

		describe("En/Decrypt list for User", function() {
			it('return decrypt the given plaintext', function() {

				var msg = 'Hello, World!',
					exported = lib.rsa.exportKeys(),
					publicKey = {
						_id: exported._id,
						publicKey: exported.pubkeyPem
					},
					privateKey = {
						_id: exported._id,
						privateKey: exported.privkeyPem
					};

				// package into batchable envelope for encryption
				var envelopes = [{
						id: lib.util.UUID(),
						plaintext: msg,
						key: lib.util.random(libTest.aesKeysize),
						iv: lib.util.random(libTest.aesKeysize),
						receiverPk: publicKey._id
					}
				];

				// encrypt
				var encryptedList = lib.cryptoBatch.encryptListForUser(envelopes, [publicKey], privateKey);
				assert.ok(encryptedList);
				assert.equal(encryptedList.length, 1);

				// decrypt
				var decryptedList = lib.cryptoBatch.decryptListForUser(encryptedList, [publicKey], privateKey);
				assert.equal(msg, decryptedList[0]);

			});
		});

		describe("En/Decrypt keys and items seperately for User", function() {
			it('return decrypt the given plaintext', function() {

				var msg = 'Hello, World!',
					exported = lib.rsa.exportKeys(),
					publicKey = {
						_id: exported._id,
						publicKey: exported.pubkeyPem
					},
					privateKey = {
						_id: exported._id,
						privateKey: exported.privkeyPem
					};

				// package into batchable envelope for encryption
				var envelopes = [{
						id: lib.util.UUID(),
						plaintext: msg,
						key: lib.util.random(libTest.aesKeysize),
						iv: lib.util.random(libTest.aesKeysize),
						receiverPk: publicKey._id
					}
				];

				// encrypt
				var encryptedList = lib.cryptoBatch.encryptListForUser(envelopes, [publicKey], privateKey);
				assert.ok(encryptedList);
				assert.equal(encryptedList.length, 1);

				// decrypt
				var encryptedKeyList = lib.cryptoBatch.decryptListKeysForUser(encryptedList, [publicKey], privateKey);
				var decryptedList = lib.cryptoBatch.decryptList(encryptedKeyList);
				assert.equal(msg, decryptedList[0].plaintext);

			});
		});

	});
}

if (typeof define !== 'undefined' && define.amd) {
	define(['chai', 'cryptoLib/../crypto-lib'], function(chai, cryptoLib) {
		doTests(chai.assert, cryptoLib);
	});
} else if (typeof module !== 'undefined' && module.exports) {
	var lib = require('../crypto-lib');
	doTests(require('chai').assert, lib);
}