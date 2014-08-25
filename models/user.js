var ldap = require('ldapjs');

module.exports = function(sequelize, DataTypes) {
    var User = sequelize.define('User', {
        netid: {type: DataTypes.STRING, unique: true},
        name: DataTypes.STRING
    }, {
        classMethods: {
            associate: function(models) {
                User.hasMany(models.Course);
            }
        },
        setterMethods: {
            netid: function(netid) {
                return this.setDataValue('netid', netid.toLowerCase());
            }
        },
        hooks: {
            beforeCreate: function(user, fn) {
                var client = ldap.createClient({
                    url: 'ldap://ldap.uiuc.edu:389'
                });
                var base = 'dc=uiuc,dc=edu';
                var opts = {
                    filter: 'uid=' + user.netid,
                    scope: 'sub',
                    sizeLimit: 1
                };
                client.search(base, opts, function(err, res) {
                    res.on('searchEntry', function(entry) {
                        user.name = (entry.object.uiucEduFirstName + ' ' +
                                     entry.object.uiucEduLastName);
                        fn(null, user);
                    });
                    res.on('error', function() {
                        fn(null, user);
                    });
                });
            }
        }
    });
    return User;
};
