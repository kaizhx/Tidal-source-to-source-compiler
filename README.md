# Tidal-source-to-source-compiler

A small source-to-source compiler created by Kai Zhen.

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
* Generator

Given the example input below, let's explore what each of the components is responsible for:

```javascript
let a = 5;
let b = 3;

function sum(a, b) {
  return a + b;
}

if (a > b) {
  return a;
} else {
  return b;
}
```

### Tokenizer

The tokenizer (implemented by the tokenize function) iterates through the provided input to create a sequence of tokens - basic syntactic units - which are then stored in an array called "tokens". It does so by comparing a string element with a set of regular expressions and assigns it a corresponding value/type. The resulting token is then saved as an object in the token array. The function iterates through the finished token array a few more times afterwards to update generic token types to more specific ones (e.g. changing the token type to "KEYWORD" or "FUNCTION_CALL" instead of "IDENTIFIER"):


#### Visualization of token array

https://replit.com/@codexserenity/TidalTokenizerDemo#tokenizer_demo.js (Press the "Run" button to execute the tokenize function)

### Parser

The parser (implemented by the parse function) uses the generated token array to construct an AST, or abstract syntax tree. The AST is a way to represent the abstract syntactic structure of the input text in form of a tree structure. This allows us to specify relations between syntactic units.

It accomplishes this by using several helper functions multiple times while parsing through the token array:

* returnEndPositionOfStatement - Returns the index of the next token in the token array that signalizes the end of a statement; usually a token with value ";" or "}"

We define a node class and instantiate a node object for each element in the token array. A node has the same value/type as the corresponding token  together with an additional "next" property: An array that keeps track of all nodes succeeding that particular node.

* returnStatementAsNode
  * Takes a sequence of tokens in the token array that make up a statement
  * Assigns each token a precedence (realized by the function addTokenPrecedence)
  * Instantiates a node object each representing a token and pushes it to a node array (realized by the function returnExpressionAsNodeArray)
  * Repeatedly obtains the node with an operator (e.g. "=", "<") as its value that has the highest operator precedence (realized by the function returnMaxPrecedence)
  * Connects the operator node with the left and right operand node by pushing both to the "next" property of the operator node (realized by the function connectExpressionNodes)

#### Visualization of AST (abstract syntax tree)

https://replit.com/@codexserenity/TidalParserDemo#parser_demo.js (Press the "Run" button to execute the parse function)

### Transformer

The transformer (implemented by the transform function) takes the AST as input and modifies the tree based on the target language (Python). The function usually performs a lot of structural changes to the AST but a lot of programming concepts in JavaScript and Python are structurally quite similar so not much needs to be done in this particular step. For statements are one example when it comes to structural differences:


For statements contain up to three expressions in Javascript: Initialization (e.g. let i = 0), condition (e.g. i < 3) and afterthought (e.g. i++). In Python, for statements typically use either specific syntax to loop through entire sequences or the range() function to loop through a set range.

The transform function takes certain parts of the three expressions and maps them to the corresponding parts in Python: 
* i from initialization expression -> identifier i
* 0 from initialization expression -> start of range function: range(0, -)
* 3 from condition expression -> end of range function: range(0, 3)
* i++ from afterthought expression -> step of range function: range(0, 3, 1) or just range(0, 3)

As a result, the following JavaScript code

```javascript
for (let i = 0; i < 3; i++) {
  console.log("Hello World");
}
```

compiles to the Python Code

```python
for i in range(0, 3):
  print("Hello World")
```

### Generator

The transformer (implemented by the generate function) performs multiple in-order tree traversals on the modified AST to generate the final output code in Python.

#### Compiled Python code for example JavaScript input

https://replit.com/@codexserenity/TidalCompilerDemo#compiler_demo.js (Press the "Run" button to execute the compiler)



Please take a look at the source code if you want to learn more about these components and the various helper functions that make up the program!
