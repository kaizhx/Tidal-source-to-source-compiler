# Tidal-source-to-source-compiler

A small source-to-source compiler created by /ME/.

## Overview

Tidal is a source-to-source compiler (written completely in JavaScript) that takes JavaScript code and translates it into semantically equivalent Python code.\
The program was created as part of an effort to learn and practice various software engineering and algorithmic design principles (e.g. data structures, tree traversal, dynamic programming) by designing and implementing a larger scale application for the first time. Below is the EBNF-based grammar - essentially a subset of the entire JavaScript grammar - that can be understood and processed by the compiler.
If you're interested to learn how the program was built, head to the "How it works" section to read more about it.

## Functionality

**Disclaimer: The program uses the semicolon symbol (" ; ") to identify the end of a statement and curly brackets (" { ", &nbsp;" } ") for a block of statements. Note that these symbols cannot be omitted:**

```javascript
// The if-statement

if (a === b)
  console.log("true");

// causes an error: The curly brackets ("{", "}") that make up the body of the if-statement are missing. Instead write 

if (a === b) {
  console.log("true");
}

// The following sequence of statements

let a = sum(1, 2)
console.log("Apple")
console.log(a)

// will also cause an error: Statements need to end with a semicolon symbol (";"). Instead write

let a = sum(1, 2);
console.log("Apple");
console.log(a);

```

Please keep in mind that the project in its current form was mainly created for learning purposes and is therefore not completely free of bugs. Although it should support the basic functionality mentioned below, it might not work correctly for some types of input.

Tidal currently supports the following programming concepts:

* variable declaration
* function declaration
* conditional statement
* loop
  * for statement (limited, see grammar below)
  * while statement
* function call
* return statement
* variable assignment
* expression

### EBNF-based grammar

**program** = statement, &nbsp;{ statement } &nbsp;;

**conditional** = if-statement, &nbsp;{ "else" &nbsp;if-statement }, &nbsp;\[ "else", &nbsp;"{", &nbsp;statement, &nbsp;{ statement }, &nbsp;"}" \] &nbsp;;

**if-statement** = "if", &nbsp;"(", &nbsp;comparison, &nbsp;")", &nbsp;"{", &nbsp;statement, &nbsp;{ statement },&nbsp;"}" &nbsp;;

**loop** = for-statement | while-statement

**for-statement** = "for", &nbsp;"(", &nbsp;variable-declaration, &nbsp;comparison, &nbsp;";", &nbsp;variable-assignment, &nbsp;")", &nbsp;"{", &nbsp;statement, &nbsp;{ statement },&nbsp;"}" &nbsp;;

**while-statement** = "while", &nbsp;"(", &nbsp;comparison, &nbsp;")", &nbsp;"{", &nbsp;statement, &nbsp;{ statement },&nbsp;"}" &nbsp;;

**function-declaration** = "def", &nbsp;whitespace, &nbsp;identifier, &nbsp;function-params, &nbsp;"{"  , &nbsp;statement, &nbsp;{ statement }, &nbsp;"}" &nbsp;;

**function-params** = "(", &nbsp;\[ Identifier, &nbsp;{ "," , &nbsp;Identifier } \] , &nbsp;")" &nbsp;;

**function-call** = Identifier, &nbsp;function-args, &nbsp;";" &nbsp;;

**function-args** = "(", &nbsp;\[ expression, &nbsp;{ "," , &nbsp;expression } \] , &nbsp;")" &nbsp;;

**variable-declaration** = "let" | "const" , &nbsp;whitespace, &nbsp;identifier, &nbsp;whitespace, &nbsp;"=", &nbsp;whitespace, &nbsp;expression, &nbsp;";" &nbsp;;

**variable-assignment** = ( identifier, &nbsp;whitespace, &nbsp;"=" | "+=" | "-=" | "*=" | "/=" | "**=" | "%=" , &nbsp;whitespace, &nbsp;expression ) | "++", &nbsp;identifier | identifier, &nbsp;"++" | "--", &nbsp;identifier | identifier, &nbsp;"--" &nbsp;;

**return-statement** = "return", &nbsp;whitespace, &nbsp; expression , &nbsp;";" &nbsp;;

**expression** = term, &nbsp;{ "+" | "-" | "*" | "**" | "%" | "/" |  &nbsp;term} &nbsp;;

**term** = identifier | number | string | boolean | function-call | "(", &nbsp;expression, &nbsp;")" &nbsp;;

**comparison** = expression, &nbsp;\[ comparison-operator, &nbsp;expression \]

**comparison-operator** = "===" | "!==" | "<" | ">" | "<=" | ">=" &nbsp;;

**statement** = function-declaration | conditional | loop | variable-declaration | variable-assignment | function-call | return-statement

**identifier** = letter,&nbsp; { letter | digit | "_" } &nbsp;;

**letter** = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L" | "M" | "N" | "O" | "P" | "Q" | "R" | "S" | "T" | "U" | "V" | "W" | "X" | "Y" | "Z" | "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i" | "j" | "k" | "l" | "m" | "n" | "o" | "p" | "q" | "r" | "s" | "t" | "u" | "v" | "w" | "x" | "y" | "z" &nbsp;;

**string** = """, &nbsp;{ all-characters - """ }, &nbsp;""" &nbsp;;

**number** = \[ "-" \]&nbsp;,  &nbsp;digit,  &nbsp;{ digit } &nbsp;;

**digit** = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" &nbsp;;

**boolean** = "true" | "false" &nbsp;;

**white-space** = ?&nbsp; white space characters &nbsp;? &nbsp;;

**all-characters** = ?&nbsp; all visible characters &nbsp;? &nbsp;; 

## Examples

### Variable declaration

```javascript
const fruit = "Apple";
```

compiles to

```python
FRUIT = "Apple"
```

### Function declaration

```javascript
function sum(a, b) {
  return a + b;
}
```

compiles to

```python
def sum(a, b):
  return a + b
```
### Loop

```javascript
for (let i = 0; i < 3; i++) {
  console.log("Hello World");
}
```

compiles to

```python
for i in range(0, 3):
  print("Hello World")
```

## How it works

The compiler is made up of the following components:
* Tokenizer
* Parser
* Transformer
* Code Generator

Given the example input below, let's explore what each of the components is responsible for:

```javascript
let a = 5;
let b = 3;
let c = 1;
const fruits = "Apple";

function sum(a, b, c) {
  return a + b + c;
}

if (a > b) {
  return a;
} else {
  return b;
}
```

### Tokenizer

The tokenizer (implemented by the tokenize() function) iterates through the provided input to create a sequence of tokens - basic syntactic units - which are then stored in an array called "tokens". Each of these tokens is assigned a value and type:

#### Visualization of token array

https://replit.com/@codexserenity/TidalTokenizerDemo#tokenizer_demo.js (Press the "Run" button to execute the tokenize function)







