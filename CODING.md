## General Rules

### Indenting

Always set your editor to insert two spaces for every tab-stop.

#### Rationale

Using two space tab stops is easily visually discerned and improves readability without sacrificing page space.

### Quoting

Always use single-quotes *unless you need to escape a single quote inside the string*
but even then, prefer `'quoted \'thing\' here'` over using double-quotes.

#### Rationale

Consistent quoting improves both readability and understandability.

**NOTE**: A lot of developers I know prefer code that can be read "with a glance" rather than
something they have to convert in their heads to a more understandable form. This is especially
critical when bug-hunting under time pressure.

### Strict Mode

Always add `use 'strict';` as the first non-whitespace, non-comment line of all modules.

### Rationale

See [John Resig - ECMAScript 5 Strict Mode, JSON, and More](http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/).

**NOTE:** Strict mode will throw an error if you attempt to use the global object. See [Use of Global Scope](https://github.com/raisch/sandbox/blob/master/CODING.md#use-of-global-scope)

### Use Of Global Scope

Never scope variables globally.

See [Scoping Rules](https://github.com/raisch/sandbox/blob/master/CODING.md#scoping-rules).

#### Rationale

**Q: Why are globals considered dangerous?** (Extracted/edited from [hallettj/global-variables-are-bad.js](https://gist.github.com/hallettj/64478))

**A:**
```js
// It is important to declare your variables.

(function() {
    var foo = 'Hello, world!';
    console.log(foo);  //=> Hello, world!
})();

console.log(foo);  //=> ERROR

// Because if you don't, they become global variables.

(function() {
    foo = 'Hello, world!';
    console.log(foo)  //=> Hello, world!
})();

console.log(foo)  //=> Hello, world!


// And when global variables sneak into your code they can cause problems,
// especially in applications with concurrency.

const printRange = function() {
    for (i = 0; i < 10; i += 1) { // i is either globally or module-scoped.
        console.log(i);
    }
};

printRange();  //=> 0 1 2 3 4 5 6 7 8 9

var eatUpRange = function() {
    for (i = 0; i < 10; i += 1) {
        // don't print anything;
    }
};

// Both loops increment i at the same time, which causes strange behavior.
window.setTimeout(eatUpRange, 10);
window.setTimeout(printRange, 10);  //=> 2 3 7 8 9 !!!
```

### Scoping Rules

Know your scoping rules and scope all variables correctly.

- `global.i = 0` is globally scoped - (See [Use of Global Scope](https://github.com/raisch/sandbox/blob/master/CODING.md#use-of-global-scope))
- `i = 0` is module-scoped.
- `var i = 0` is function or module-scoped.
- `const i = 0` is *IMMUTABLE* and block-scoped, or if declared outside of a block, module-scoped.
- `let i = 0` is *MUTABLE* and block-scoped, or if declared outside of a block, module-scoped.

```js
function() { // incorrect
  var foo = true; // foo is scoped to the module
  var bar = false;

  foo = !foo;
}

function() { // correct
  let foo = true;
  const bar = false;

  foo = !foo;
}
```

When in doubt, use `const`.

#### Rationale

Improperly scoped variables can cause a host of subtle, difficult to locate errors.

Since we have a lot of legacy code that uses the global object (which strict mode will not allow),
we prefer to refactor this

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
### Variable Declarations

Always define variables with `let` or `const`.

#### Rationale

Misusing variable declarations can inject subtle, difficult to find errors into your code.

Using `let` or `const` allows the JavaScript intrepreter to help you write better code.

```js
// module.js
let foo = 1;
const bar = 1;

module.exports = {
  assignToLet: function() { return foo = 2; },
  assignToConst: function() { return bar = 2; }
}

// consumer
const m = require('./module.js');

> m.assignToLet() // => 2

> m.assignToConst() // throws TypeError: Assignment to constant variable.
```

Consider what would happen if we mis-declared a constant using `let`, which elsewhere to which we assigned a new value.

How would you locate this error? 

Typically using the node debugger and setting a watch on the variable. 

But why would we want to go through that bother when we could have just declared the variable correctly?

__Possibly Unexpected Behavior__

Would you expect this 

```js
const obj = { foo: true };

obj.bar = false;
```

to throw a `TypeError: Assignment to constant variable`?

Well you shouldn't because we are not reassigning the value associated with the symbol `obj`. 

Rather we're setting properties within it, which doesn't violate our idea of a constant.

When in doubt, define everything you **know** shouldn't be reassigned using `const`.

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

## JS Power Developer Toolkit

### assert
### lodash
### json-safe-stringify
