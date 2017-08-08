## General Rules

### Quoting

Always use single-quotes *unless you need to escape a single quote inside the string*
but even then, prefer '\'' over double-quotes.

#### Rationale

Because we need to have one consistent kind of quoting.

### Strict Mode

Always add `use 'strict';` as the first non-whitespace, non-comment line of all modules.

See [John Resig - ECMAScript 5 Strict Mode, JSON, and More](http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/).

### Use Of [Global Scope]

Never scope variables globally.

#### Rationale

Since we have a lot of legacy code that uses the global object (which strict mode will not allow),
we prefer to refactor

```js
// producer.js
GLOBAL.FOO=true; // incorrect

// consumer.js
console.log(FOO);
```

into

```js
// producer.js
module.exports { // CORRECT
  FOO: true
};

// consumer.js
const { FOO } = require('./producer.js');

console.log(FOO);
```

Why are globals considered dangerous?

```js
// It is important to declare your variables.

(function() {
    var foo = 'Hello, world!';
    print(foo);  //=> Hello, world!
})();

// Because if you don't, the become global variables.

(function() {
    foo = 'Hello, world!';
    print(foo)  //=> Hello, world!
})();

print(foo)  //=> Hello, world!


// When global variables sneak into your code they can cause problems,
// especially in applications with concurrency.

var count = function() {
    for (i = 0; i < 10; i += 1) { // i is either globally or module-scoped.
        print(i);
    }
};

count();  //=> 0 1 2 3 4 5 6 7 8 9

var eatUpCount = function() {
    for (i = 0; i < 10; i += 1) {
        // don't print anything;
    }
};

// Both loops increment i at the same time, which causes strange behavior.
window.setTimeout(eatUpCount, 10);
window.setTimeout(count,      10);  //=> 2 3 7 8 9 !!!
```

### Module Patterns

```js
// module.js
const MODULE = {
  ...
};

MODULE.Property = true; // static "class" property

module.exports = MODULE;

// consumer.js
const Thing = require('./module');

Thing.Property === true; // true!
```

### Comments

### (In)Equality Testing

Always use the `===` and `!==` operators.

```js
if(foo == val) ... // incorrect
if(foo != val) ... // incorrect

if(foo === val) ... // CORRECT
if(foo !== val) ... // CORRECT
```

#### Rationale

The other equivalency operators (`==` and `!=`) *automagically* convert the type of
the left operand to equal that of the right operand.

```js
// Are these equivalent?

1 == '1'; // YES because '1':String is converted to 1:Number
'1' == 1; // YES because 1:Number is converted to '1':String

1 === '1'; // NO because 1:Number is not equivalent to '1':String
'1' === 1; // NO because '1':String is not equivalent to 1:Number
```

Misuse of the equivalency operators can lead to subtle, difficult to locate errors
so you should never use `==` or `!=` *unless you __really__ understand what they do*.

### Existence Testing

```js
if(typeof foo !== 'undefined' && foo !== null) { // incorrect
  ...
}

if(!_.isNil(foo)) { // correct - see comment below re lodash
  ...
}
```

### Type Checking

```js
if(foo instanceof '' || foo instanceof null) { // incorrect
  ...
}

if(foo instanceof Class) { // correct
  ...
}
```

### String Composition

Use string templates rather than concatenation.

```js
var a = 'a';

var c = function() {
  return 'c';
};

var s = a + ' ' + 'b' + ' ' + c();  // incorrect
var s = `${a} b ${c()}`;            // correct
```

#### Rationale

The first (incorrect) form requires six operations:

1. set result to value of `a`
2. append ' ' to result
3. append 'b' to result
4. append ' ' to result
5. append the result of `c()` to result
6. assign result to `s`

While the second operation requires three operations:

1. get value of `a`
2. get result of `c()`
3. assign result of evaluating template to `s`

### Callback Pattern

Use the standard callback pattern.

If you must deviate from this, add COPIOUS documentation.

```js
function(...args, cb) {
  obj.method(...args, (err, res) => {
    if(err) {
      cb(err);
      return;
    }
    cb(null,res);
  })
}
```

### Scoping Rules

Know your scoping rules and scope all vars correctly.

- `var` is scoped to the module.
- `let` and `const` are scoped to the enclosing block.

When in doubt, use `const`.

```js
function() { // incorrect
  var foo = true; // foo is scoped to the module
  var bar = false;

  foo = !foo;
}
```

```js
function() { // correct
  let foo = true;
  const bar = false;

  foo = !foo;
}
```

### Arrow Functions

```js
  // incorrect
  method() {
    const _this = this;
    obj.method(...args, function(err, res) {
      _this.reportError('...');
    })
  }

  // CORRECT
  method() {
    obj.method(...args, (err, res) => { // preserves value of this
      this.reportError('...');
    })
  }
```

## JS Developer Toolkit

### lodash
