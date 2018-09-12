var ldap = require('ldapjs');

var config = require('../config');

module.exports = function(sequelize, DataTypes) {
    var User = sequelize.define('user', {
        netid: {type: DataTypes.STRING, unique: true},
        name: DataTypes.STRING
    }, {
        setterMethods: {
            netid: function(netid) {
                return this.setDataValue('netid', netid.toLowerCase());
            }
        },
        hooks: {
            afterCreate: function(user, options) {
                return new Promise((resolve, reject) => {
                    // Skip name lookup if testing because Travis CI is not on the
                    // campus network
                    if (!config.authenticationEnabled ||
                        process.env.NODE_ENV === 'test') {
                        return resolve();
                    }
                    console.log(user);
                    console.log(user.getNameFromLDAP);
                    user.getNameFromLDAP((err) => err ? reject(err) : resolve());
                });
            }
        }
    });
    User.associate = function(models) {
        User.belongsToMany(models.Course, {through: 'staff'});
        User.hasMany(models.Checkin);
    };

    User.prototype.getNameFromLDAP = function(callback) {
        var client = ldap.createClient({
            url: 'ldaps://ldap.illinois.edu:636'
        });
        var base = 'dc=uiuc,dc=edu';
        var opts = {
            filter: 'uid=' + this.netid,
            scope: 'sub',
            sizeLimit: 1
        };
        client.search(base, opts, function (err, res) {
            if (err) return callback(err);
            res.on('searchEntry', function (entry) {
                this.updateAttributes({
                    name: (entry.object.uiucEduFirstName + ' ' +
                        entry.object.uiucEduLastName)
                });
            }.bind(this));
            res.on('end', function () {
                callback(null);
            });
        }.bind(this));
    }
    return User;
};
