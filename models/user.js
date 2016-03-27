var ldap = require('ldapjs');

module.exports = function(sequelize, DataTypes) {
    var User = sequelize.define('user', {
        netid: {type: DataTypes.STRING, unique: true},
        name: DataTypes.STRING
    }, {
        classMethods: {
            associate: function(models) {
                User.belongsToMany(models.Course, {through: 'staff'});
                User.hasMany(models.Checkin);
            }
        },
        instanceMethods: {
            /**
             * Get user's full name from Campus LDAP in the background and save
             * it to the instance.
             */
            getNameFromLDAP: function() {
                var client = ldap.createClient({
                    url: 'ldap://ldap.uiuc.edu:389'
                });
                var base = 'dc=uiuc,dc=edu';
                var opts = {
                    filter: 'uid=' + this.netid,
                    scope: 'sub',
                    sizeLimit: 1
                };
                client.search(base, opts, function(err, res) {
                    if (err) return;
                    res.on('searchEntry', function(entry) {
                        this.updateAttributes({
                            name: (entry.object.uiucEduFirstName + ' ' +
                                   entry.object.uiucEduLastName)
                        });
                    }.bind(this));
                }.bind(this));
            }
        },
        setterMethods: {
            netid: function(netid) {
                return this.setDataValue('netid', netid.toLowerCase());
            }
        },
        hooks: {
            afterCreate: function(user) {
                user.getNameFromLDAP();
            }
        }
    });
    return User;
};
