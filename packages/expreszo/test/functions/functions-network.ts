import assert from 'assert';
import { Parser } from '../../index';

describe('Network Functions TypeScript Test', function () {
  describe('ipInRange(ip, cidr)', function () {
    it('should return true for addresses inside the block', function () {
      const parser = new Parser();
      assert.strictEqual(parser.evaluate('ipInRange("10.1.2.3", "10.0.0.0/8")'), true);
      assert.strictEqual(parser.evaluate('ipInRange("192.168.1.5", "192.168.1.0/24")'), true);
      assert.strictEqual(parser.evaluate('ipInRange("172.16.5.4", "172.16.0.0/16")'), true);
    });

    it('should return false for addresses outside the block', function () {
      const parser = new Parser();
      assert.strictEqual(parser.evaluate('ipInRange("192.168.1.5", "10.0.0.0/8")'), false);
      assert.strictEqual(parser.evaluate('ipInRange("192.168.2.1", "192.168.1.0/24")'), false);
    });

    it('should treat /32 as an exact host match', function () {
      const parser = new Parser();
      assert.strictEqual(parser.evaluate('ipInRange("10.0.0.1", "10.0.0.1/32")'), true);
      assert.strictEqual(parser.evaluate('ipInRange("10.0.0.2", "10.0.0.1/32")'), false);
    });

    it('should treat /0 as matching every address', function () {
      const parser = new Parser();
      assert.strictEqual(parser.evaluate('ipInRange("8.8.8.8", "0.0.0.0/0")'), true);
      assert.strictEqual(parser.evaluate('ipInRange("255.255.255.255", "0.0.0.0/0")'), true);
    });

    it('should handle boundary octet 255 and high addresses', function () {
      const parser = new Parser();
      assert.strictEqual(parser.evaluate('ipInRange("255.255.255.255", "255.255.255.0/24")'), true);
      assert.strictEqual(parser.evaluate('ipInRange("200.100.50.25", "200.100.0.0/16")'), true);
    });

    it('should return undefined if any argument is undefined', function () {
      const parser = new Parser();
      assert.strictEqual(parser.evaluate('ipInRange(undefined, "10.0.0.0/8")'), undefined);
      assert.strictEqual(parser.evaluate('ipInRange("10.0.0.1", undefined)'), undefined);
    });

    it('should throw for a malformed IP address', function () {
      const parser = new Parser();
      assert.throws(() => parser.evaluate('ipInRange("10.0.0.256", "10.0.0.0/8")'), /invalid IPv4/);
      assert.throws(() => parser.evaluate('ipInRange("10.0.0", "10.0.0.0/8")'), /invalid IPv4/);
      assert.throws(() => parser.evaluate('ipInRange("abc", "10.0.0.0/8")'), /invalid IPv4/);
      assert.throws(() => parser.evaluate('ipInRange("10.0.0.x", "10.0.0.0/8")'), /invalid IPv4/);
      assert.throws(() => parser.evaluate('ipInRange("10.0.0.1", "999.0.0.0/8")'), /invalid IPv4/);
    });

    it('should throw for a malformed CIDR', function () {
      const parser = new Parser();
      assert.throws(() => parser.evaluate('ipInRange("10.0.0.1", "10.0.0.0")'), /invalid CIDR/);
      assert.throws(() => parser.evaluate('ipInRange("10.0.0.1", "10.0.0.0/33")'), /invalid CIDR prefix/);
    });

    it('should throw for non-string arguments', function () {
      const parser = new Parser();
      assert.throws(() => parser.evaluate('ipInRange(123, "10.0.0.0/8")'), /expects a string/);
    });
  });
});
