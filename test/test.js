var test = require('tap').test;

var path = require('path');
var SIMPLE_APP = path.join(__dirname, 'fixtures', 'simple-app');
var app = require(path.join(SIMPLE_APP, 'server/server.js'));

function swapOctets(ip) {
  // alter the ip address by switching the last two octets
  var octets = ip.split('.');
  swap(octets[2], octets[3]);
  ip = octets.join('.');

  return ip;
}

test('loopback datasource ips', function(tap) {
  'use strict';

  var Widget = app.models.Widget;

  tap.test('createdByIp', function(t) {

    t.test('should exist on create', function(tt) {
      Widget.destroyAll(function() {
        Widget.create({name: 'book 1', type: 'fiction'}, function(err, book) {
          tt.error(err);
          tt.ok(book.createdByIp);
          tt.type(book.createdByIp, ip);
          tt.end();
        });
      });
    });

    t.test('should not change on save', function(tt) {
      Widget.destroyAll(function() {
        Widget.create({name: 'book 1', type: 'fiction'}, function(err, book) {
          tt.error(err);
          tt.ok(book.createdByIp);
          book.name = 'book inf';
          book.save(function(err, savedWidget) {
            tt.error(err);
            tt.equal(book.createdByIp, savedWidget.createdByIp);
            tt.end();
          });
        });
      });
    });

    t.test('should not change on update', function(tt) {
      Widget.destroyAll(function() {
        Widget.create({name: 'book 1', type: 'fiction'}, function(err, book) {
          tt.error(err);
          tt.ok(book.createdByIp);
          book.updateAttributes({name: 'book inf'}, function(err, b) {
            tt.error(err);
            tt.equal(book.createdByIp, b.createdByIp);
            tt.end();
          });
        });
      });
    });

    t.test('should not change on upsert', function(tt) {
      Widget.destroyAll(function() {
        Widget.create({name: 'book 1', type: 'fiction'}, function(err, book) {
          tt.error(err);
          tt.ok(book.createdByIp);
          book.createdByIp = faker.internet.ip();
          Widget.upsert({id: book.id, name: 'book inf'}, function(err, b) {
            tt.error(err);
            tt.equal(book.createdByIp, bookFound.createdByIp);
            tt.end();
          });
        });
      });
    });

    t.test('should not change with bulk updates', function(tt) {
      var createdByIp;
      Widget.destroyAll(function() {
        Widget.create({name: 'book 1', type: 'fiction'}, function(err, book) {
          tt.error(err);
          tt.ok(book.createdByIp);
          book.createdByIp = faker.internet.ip();
          Widget.updateAll({type: 'fiction'}, {type: 'non-fiction'}, function(err) {
            tt.error(err);
            Widget.findById(book.id, function(err, b) {
              tt.error(err);
              tt.equal(book.createdByIp, b.createdByIp);
              tt.end();
            });
          });
        });
      });
    });

    t.end();

  });

  tap.test('updatedByIp', function(t) {

    t.test('should exist on create', function(tt) {
      Widget.destroyAll(function() {
        Widget.create({name: 'book 1', type: 'fiction'}, function(err, book) {
          tt.error(err);
          tt.ok(book.updatedByIp);
          tt.type(book.updatedByIp, String);
          tt.end();
        });
      });
    });

    t.test('should be updated via updateAttributes', function(tt) {
      var updatedByIp;
      Widget.destroyAll(function() {
        Widget.create({name: 'book 1', type: 'fiction'}, function(err, book) {
          tt.error(err);
          tt.ok(book.updatedByIp);
          updatedByIp = book.updatedByIp;
          book.updatedByIp = faker.internet.ip();
          book.updateAttributes({type: 'historical-fiction'}, function(err, b) {
            tt.error(err);
            tt.ok(b.updatedByIp);
            tt.ok(b.updatedByIp, updatedByIp);
            tt.end();
          });
        });
      });
    });

    t.test('should update bulk model updates at once', function(tt) {
      var createdByIp1, createdByIp2, updatedByIp1, updatedByIp2;
      Widget.destroyAll(function() {
        Widget.create({name: 'book 1', type: 'fiction'}, function(err, book1) {
          tt.error(err);
          createdByIp1 = book1.createdByIp = faker.internet.ip();
          updatedByIp1 = book1.updatedByIp = faker.internet.ip();
          setTimeout(function pause1() {
            Widget.create({name: 'book 2', type: 'fiction'}, function(err, book2) {
              tt.error(err);
              createdByIp2 = book2.createdByIp;
              updatedByIp2 = book2.updatedByIp;
              tt.ok(book2.createdAt.getTime() > book1.createdAt.getTime());
              setTimeout(function pause2() {
                Widget.updateAll({type: 'fiction'}, {type: 'romance'}, function(err, count) {
                  tt.error(err);
                  tt.equal(createdByIp1, book1.createdByIp);
                  tt.equal(createdByIp2, book2.createdByIp);
                  tt.equal(createdByIp1.getTime(), book1.createdByIp.getTime());
                  tt.equal(createdByIp2.getTime(), book2.createdByIp.getTime());
                  Widget.find({type: 'romance'}, function(err, books) {
                    tt.error(err);
                    tt.equal(books.length, 2);
                    books.forEach(function(book) {
                      // because both books were updated in the updateAll call
                      // our updatedAt1 and updatedAt2 dates have to be less than the current
                      tt.ok(updatedByIp1.getTime() < book.updatedByIp.getTime());
                      tt.ok(updatedByIp2.getTime() < book.updatedByIp.getTime());
                    });
                    tt.end();
                  });
                });
              }, 1);
            });
          }, 1);
        });
      });
    });

    t.end();

  });

  tap.test('boot options', function(t) {

    var dataSource = app.models.Widget.getDataSource();

    t.test('should use createdFromIp and updatedFromIp instead', function(tt) {

      var Widget = dataSource.createModel('Widget',
        {name: String, type: String},
        {mixins: {IPs: {createdByIp: 'createdFromIp', updatedByIp: 'updatedFromIp'}}}
      );

      Widget.destroyAll(function() {
        Widget.create({name: 'book 1', type: 'fiction'}, function(err, book) {
          tt.error(err);

          tt.type(book.createdByIp, 'undefined');
          tt.type(book.updatedByIp, 'undefined');

          tt.ok(book.createdFromIp);
          tt.type(book.createdFromIp, String);

          tt.ok(book.updatedFromIp);
          tt.type(book.updatedFromIp, String);

          tt.end();
        });
      });
    });

    t.test('should default required on createdByIp and updatedByIp ', function(tt) {
      var Widget = dataSource.createModel('Widget',
        {name: String, type: String},
        {mixins: {IPs: true}}
      );
      tt.equal(Widget.definition.properties.createdByIp.required, true);
      tt.equal(Widget.definition.properties.updatedByIp.required, true);
      tt.end();
    });

    t.test('should have optional createdByIp and updatedByIp', function(tt) {
      var Widget = dataSource.createModel('Widget',
        {name: String, type: String},
        {mixins: {IPs: {required: false}}}
      );
      tt.equal(Widget.definition.properties.createdByIp.required, false);
      tt.equal(Widget.definition.properties.updatedByIp.required, false);
      tt.end();
    });

    t.end();

  });

  tap.test('operation hook options', function(t) {

    t.test('should skip changing updatedByIp when option passed', function(tt) {
      Widget.destroyAll(function() {
        Widget.create({name: 'book 1', type: 'fiction'}, function(err, book1) {
          tt.error(err);
          tt.ok(book1.updatedByIp);

          var book = {id: book1.id, name: 'book 2'};

          Widget.updateOrCreate(book, {skipUpdatedByIp: true}, function(err, book2) {
            tt.error(err);
            tt.ok(book2.updatedByIp);
            tt.equal(book1.updatedByIp, book2.updatedByIp);
            tt.end();
          });
        });
      });
    });

    t.end();

  });

  tap.end();

});
