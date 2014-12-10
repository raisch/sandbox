(function () {

  /**
   * Converts an ipaddr (String) to a long.
   * @param {String} addr
   * @returns {Number} long
   */
      /*
  var ip2long = function ip2long(addr) {
    var b=0, c=0, d;
    for (
        c = b = 0;
        d = addr.split('.')[b++];
        c +=
            d >> 8
            |
            b > 4 ? NaN :
        cd d * (1 << -8 * b)
    )
      d = parseInt(
          +d
          &&
          d
      );
    return c
  };
*/
  var ip2long=function(addr){
    if(!('string'===typeof addr && addr.length >= 7)){ // 1.0.0.0
      throw new TypeError('requires an ipaddr')
    }
    var parts=addr.split('.');
    while(parts.length<4){
      parts=(parts+'.0').split('.');
    }
    if(parts.length!==4){
      throw new TypeError('requires an ipaddr string');
    }
    return (parseInt(parts[0],10)<<24)+(parseInt(parts[1],10)<<16)+(parseInt(parts[2],10)<<8)+parseInt(parts[3],10);
  };

  var getNumAddrs=function getNumAddrs(offset){
    return Math.pow(2,32-parseInt(offset,10));
  };

  /**
   *
   * @param mask
   * @returns {Number[]}
   */
  var createAddrRange = function createAddrRange(mask) {
    if (mask.indexOf('/') < 0) {
      throw new TypeError('requires a CIDR netmask, i.e. 10.0.0.0/8')
    }
    var parts = mask.split('/');
    if (parts.length !== 2) {
      throw new TypeError('not a CIDR netmask, must have one and only one slash');
    }
    while (parts[0].split('.').length < 4) {
      parts[0] += '.0';
    }
    var start = ip2long(parts[0]),
        numAddrs = getNumAddrs(parts[1]), // number of addrs in range
        end = start + numAddrs;
    return [start, end, numAddrs];
  };

  /**
   *
   * @return {Function}
   */
  var createAddrValidator = exports.createAddrValidator = function createAddrValidator(fName, ranges) {
    ranges = Array.isArray(ranges) ? ranges : ranges ? [ranges] : ['0.0.0.0/32'];
    var func = fName + '=function ' + fName + '(ipaddr){\n';
    func += '\tvar a=ip2long(ipaddr);\n';
    ranges.forEach(function (range) {
      var cidr = createAddrRange(range);
      func += '\tif(a>=' + cidr[0] + ' && a<=' + cidr[1] + ') return true;\n';
    });
    func += '\treturn false;\n}';
    var fn = null;
    try {
      fn = eval(func);
    }
    catch (e) {
      throw new Error('failed to eval func: ' + e + '\n\n' + func);
    }
    return fn;
  };

  var allowedRanges = [
    '10.0.0.0/8',
    '172.16.0.0/12',
    '192.168.0.0/16',
    '8.8.8.8/32'
  ];

  var validator = createAddrValidator('validator', allowedRanges);

  console.log(validator.toString());

  console.time('start');

  for(var i= 0,len=1000000;i<len;i++) {

    ['10.0.0.1', '11.0.1.1', '10.1.0.1', '192.168.0.1', '192.169.0.1', '8.8.8.8'].forEach(validator);
  }
  console.timeEnd('start');

  module.exports={
    ip2long:ip2long,
    //ip2long2:ip2long2,
    getNumAddrs:getNumAddrs,
    createAddrRange: createAddrRange,
    createAddrValidator: createAddrValidator
  };

})();
