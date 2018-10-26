var ejs = require('ejs');
var moment = require('moment');
var nodemailer = require('nodemailer');

var config = require('./config');
var db = require('./models');

var transporter = nodemailer.createTransport(config.smtp, config.mailDefaults);

exports.sendConfirmationEmail = function(checkin) {
    if (!config.emailEnabled) return;
    db.Checkin.find({
        where: {id: checkin.id},
        include: [
            db.User,
            {model: db.Section, include: [db.Course]}
        ]
    }).then(function(checkin) {
        db.Student.find({
            where: {
                courseId: checkin.section.course.id,
                uin: checkin.uin
            }
        }).then(function(student) {
            ejs.renderFile('views/email/confirmation.ejs', {
                checkin: checkin,
                student: student,
                checkinTime: moment(checkin.createdAt).format('l LTS')
            }, function(err, text) {
                if (err) return;
                transporter.sendMail({
                    to: student.netid + '@illinois.edu',
                    subject: 'Attendance: ' + checkin.section.course.name + ' - ' + checkin.section.name,
                    text: text
                });
            });
        });
    });
};
