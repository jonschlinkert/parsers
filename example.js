var parsers = require('./');



var marked = parsers.marked;
console.log(marked.parseSync('# Foo'));
console.log(marked('# Foo'));

var remarkable = parsers.remarkable;
console.log(remarkable.parseSync('# Foo'));
console.log(remarkable('# Foo'));

var markdownjs = parsers.markdownjs;
console.log(markdownjs.parseSync('# Foo'));
console.log(markdownjs('# Foo'));

var matter = parsers.matter;
console.log(matter.parseSync('# Foo'));
console.log(matter.parseFileSync('test/fixtures/a.md'));
console.log(matter('# Foo'));
matter('# Foo', function (err, content) {
  if (err) {
    console.log(err);
  }
  console.log(content);
});

matter.parse('# Foo', function (err, content) {
  if (err) {
    console.log(err);
  }
  console.log(content);
});

matter.parseFile('test/fixtures/a.md', function (err, content) {
  if (err) {
    console.log(err);
  }
  console.log(content);
});

