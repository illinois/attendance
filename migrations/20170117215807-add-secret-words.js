'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    return queryInterface.addColumn('checkins', 'secretWord', Sequelize.STRING).then(function() {
        return queryInterface.addColumn('courses', 'enableSecretWords', {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        });
    });
  },

  down: function (queryInterface, Sequelize) {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
    return queryInterface.removeColumn('checkins', 'secretWord').then(function() {
        return queryInterface.removeColumn('courses', 'enableSecretWords');
    });
  }
};
