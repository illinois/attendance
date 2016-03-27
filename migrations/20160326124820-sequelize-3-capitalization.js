'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
      return queryInterface.renameTable('Courses', 'courses').then(function() {
          return queryInterface.renameTable('Users', 'users');
      }).then(function() {
          return queryInterface.renameTable('CoursesUsers', 'staff');
      }).then(function() {
          return queryInterface.renameTable('Sections', 'sections');
      }).then(function() {
          return queryInterface.renameTable('Checkins', 'checkins');
      }).then(function() {
          return queryInterface.renameTable('Comments', 'comments');
      }).then(function() {
          return queryInterface.renameTable('Students', 'students');
      }).then(function() {
          return queryInterface.renameColumn('staff', 'UserId', 'userId');
      }).then(function() {
          return queryInterface.renameColumn('staff', 'CourseId', 'courseId');
      }).then(function() {
          return queryInterface.renameColumn('sections', 'CourseId', 'courseId');
      }).then(function() {
          return queryInterface.renameColumn('checkins', 'SectionId', 'sectionId');
      }).then(function() {
          return queryInterface.renameColumn('checkins', 'UserId', 'userId');
      }).then(function() {
          return queryInterface.renameColumn('comments', 'UserId', 'userId');
      }).then(function() {
          return queryInterface.renameColumn('comments', 'SectionId', 'sectionId');
      }).then(function() {
          return queryInterface.renameColumn('students', 'CourseId', 'courseId');
      });
  },

  down: function (queryInterface, Sequelize) {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
      return queryInterface.renameTable('courses', 'Courses').then(function() {
          return queryInterface.renameTable('users', 'Users');
      }).then(function() {
          return queryInterface.renameTable('staff', 'CoursesUsers');
      }).then(function() {
          return queryInterface.renameTable('sections', 'Sections');
      }).then(function() {
          return queryInterface.renameTable('checkins', 'Checkins');
      }).then(function() {
          return queryInterface.renameTable('comments', 'Comments');
      }).then(function() {
          return queryInterface.renameTable('students', 'Students');
      }).then(function() {
          return queryInterface.renameColumn('CoursesUsers', 'userId', 'UserId');
      }).then(function() {
          return queryInterface.renameColumn('CoursesUsers', 'courseId', 'CourseId');
      }).then(function() {
          return queryInterface.renameColumn('Sections', 'courseId', 'CourseId');
      }).then(function() {
          return queryInterface.renameColumn('Checkins', 'sectionId', 'SectionId');
      }).then(function() {
          return queryInterface.renameColumn('Checkins', 'userId', 'UserId');
      }).then(function() {
          return queryInterface.renameColumn('Comments', 'userId', 'UserId');
      }).then(function() {
          return queryInterface.renameColumn('Comments', 'sectionId', 'SectionId');
      }).then(function() {
          return queryInterface.renameColumn('Students', 'courseId', 'CourseId');
      });
  }
};
