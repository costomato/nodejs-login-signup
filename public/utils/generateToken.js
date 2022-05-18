function generateToken(size = 32) {
    var pass = '';
    var str = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz_0123456789';
      
    for (i = 1; i <= size; i++) {
        var char = Math.floor(Math.random()
                    * str.length + 1);
          
        pass += str.charAt(char)
    }
    
    return pass;
}

module.exports = generateToken