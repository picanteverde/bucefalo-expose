var expect = require("chai").expect,
	bucefalo = require("../dist/bucefalo-expose.module.js");

describe("Bucefalo.expose", function(){
	var socketA, socketB;
	beforeEach(function(){
		socketA = bucefalo.createFakeSocket();
		socketB = bucefalo.createFakeSocket();
		socketA.socket = socketB;
		socketB.socket = socketA;
	});
	it("should expose a singleton Object", function(){
		var a = {
			num: 3,
			get: function(){
				return this.num;
			}
		};
		var expose = bucefalo.createExposer(socketA);
		expose.expose(a,"a");

		var expose2 = bucefalo.createExposer(socketB);
		var b = expose2.get("a");

		expect(b.get()).to.equal(3);
		a.num = 4;
		expect(b.get()).to.equal(4);
	});
});
