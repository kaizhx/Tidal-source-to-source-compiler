function getText() {
  let input = document.getElementById("textareabox").value;
  let output = compile(input);
  document.getElementById("textareabox").value = output;
}

// This function implements the tokenizer

function tokenize(input) {
  let currentPosition = 0;
  let tokens = [];

  while (currentPosition < input.length) {
    let currentCharacter = input[currentPosition];
    
    const IDENTIFIER_START = /[A-Z]|\$|_/i;
    const IDENTIFIER = /[A-Z]|\$|_|[0-9]/i;

    if (IDENTIFIER_START.test(currentCharacter)) {
      let value = "";

      while (
        IDENTIFIER.test(currentCharacter) &&
        currentPosition < input.length
      ) {
        value += currentCharacter;
        currentCharacter = input[++currentPosition];
      }

      tokens.push({
        type: "IDENTIFIER",
        value: value,
      });

      continue;
    }

    const NUMBER = /[0-9]/;

    if (NUMBER.test(currentCharacter)) {
      let value = "";

      while (NUMBER.test(currentCharacter) && currentPosition < input.length) {
        value += currentCharacter;
        currentCharacter = input[++currentPosition];
      }

      tokens.push({
        type: "NUMBER",
        value: value,
      });

      continue;
    }

    const STRING = /"|'|`/;

    if (STRING.test(currentCharacter)) {
      let value = "";
      let startSymbol = currentCharacter;
      currentCharacter = input[++currentPosition];

      while (currentCharacter !== startSymbol) {
        value += currentCharacter;
        currentCharacter = input[++currentPosition];
      }

      currentCharacter = input[++currentPosition];

      tokens.push({
        type: "STRING",
        value: value,
      });

      continue;
    }

    const ARITH = /\+|-|\*|\/|%/;
    const DOUBLE_ARITH = /\+|-|\*/;
    const COMP = /<|>/;
    const LOGIC = /&|\|/;
    const BIT = /~|\^/;

    const EXPO = "**";
    const EQUAL = "=";
    const NOT = "!";
    const ARROW = ">";

    if (
      ARITH.test(currentCharacter) ||
      currentCharacter === EQUAL ||
      currentCharacter === NOT
    ) {
      let value = currentCharacter;
      let nextCharacter = input[currentPosition + 1];
      let nextnextCharacter = input[currentPosition + 2];

      if (currentCharacter === EQUAL && nextCharacter === ARROW) {
        value += nextCharacter;

        tokens.push({
          type: "ARROW",
          value: value,
        });

        currentPosition += value.length;
        continue;
      }

      if (
        DOUBLE_ARITH.test(currentCharacter) &&
        currentCharacter === nextCharacter
      ) {
        value = currentCharacter + nextCharacter;

        if (value === EXPO && nextnextCharacter === EQUAL) {
          value = currentCharacter + nextCharacter + EQUAL;
          tokens.push({
            type: "ASSIGNMENT_OP",
            value: value,
          });

          currentPosition += value.length;
          continue;
        }
      }

      if (
        currentCharacter !== EQUAL &&
        currentCharacter !== NOT &&
        nextCharacter === EQUAL
      ) {
        value = currentCharacter + nextCharacter;

        tokens.push({
          type: "ASSIGNMENT_OP",
          value: value,
        });

        currentPosition += value.length;
        continue;
      }

      if (currentCharacter === EQUAL || currentCharacter === NOT) {
        if (nextCharacter === EQUAL) {
          value = currentCharacter + nextCharacter;

          if (nextnextCharacter === EQUAL) {
            value = currentCharacter + nextCharacter + nextnextCharacter;
          }

          tokens.push({
            type: "COMPARISON_OP",
            value: value,
          });

          currentPosition += value.length;
          continue;
        }

        if (currentCharacter === EQUAL) {
          tokens.push({
            type: "ASSIGNMENT_OP",
            value: value,
          });
        } else {
          tokens.push({
            type: "LOGICAL_OP",
            value: value,
          });
        }
      } else {
        tokens.push({
          type: "ARITHMETIC_OP",
          value: value,
        });
      }

      currentPosition += value.length;
      continue;
    } else if (COMP.test(currentCharacter)) {
      let value = currentCharacter;
      let nextCharacter = input[currentPosition + 1];
      if (nextCharacter === EQUAL) {
        value = currentCharacter + nextCharacter;
      } else if (currentCharacter === nextCharacter) {
        value = currentCharacter + nextCharacter;

        if (currentCharacter === ">" && input[currentPosition + 2] === "=" || currentCharacter === "<" && input[currentPosition + 2] === "=") {
          value = currentCharacter + nextCharacter + input[currentPosition + 2];
          tokens.push({
            type: "ASSIGNMENT_OP",
            value: value,
          });

          currentPosition += value.length;
          continue;
        }
        if (currentCharacter === ">" && input[currentPosition + 2] === ">") {
          value = currentCharacter + nextCharacter + nextCharacter;
          if (input[currentPosition + 3] === "=") {
            value += "=";
            tokens.push({
              type: "ASSIGNMENT_OP",
              value: value,
            });

            currentPosition += value.length;
            continue;
          }
        }
        tokens.push({
          type: "BITWISE_OP",
          value: value,
        });

        currentPosition += value.length;
        continue;
      }

      tokens.push({
        type: "COMPARISON_OP",
        value: value,
      });

      currentPosition += value.length;
      continue;
    } else if (LOGIC.test(currentCharacter)) {
      let value = currentCharacter;
      let nextCharacter = input[currentPosition + 1];
      if (currentCharacter === nextCharacter) {
        if (input[currentPosition + 2] === "=") {
          value = currentCharacter + nextCharacter + input[currentPosition + 2];
          tokens.push({
            type: "ASSIGNMENT_OP",
            value: value,
          });
        } else {
          value = currentCharacter + nextCharacter;

          tokens.push({
            type: "LOGICAL_OP",
            value: value,
          });
        }
      } else {
        if (nextCharacter === "=") {
          value = currentCharacter + nextCharacter;
          tokens.push({
            type: "ASSIGNMENT_OP",
            value: value,
          });
        } else {
          tokens.push({
            type: "BITWISE_OP",
            value: value,
          });
        }
      }

      currentPosition += value.length;
      continue;
    } else if (BIT.test(currentCharacter)) {
      value = currentCharacter;
      let nextCharacter = input[currentPosition + 1];
      if (currentCharacter === "^" && nextCharacter === "=") {
        value = currentCharacter + nextCharacter;
        tokens.push({
          type: "ASSIGNMENT_OP",
          value: value,
        });
      } else {
        tokens.push({
          type: "BITWISE_OP",
          value: value,
        });
      }

      currentPosition += value.length;
      continue;
    }

    const PAR = /\(|\)/;

    if (PAR.test(currentCharacter)) {
      tokens.push({
        type: "PAR",
        value: currentCharacter,
      });

      currentPosition++;
      continue;
    }

    const CURLY = /{|}/;

    if (CURLY.test(currentCharacter)) {
      tokens.push({
        type: "CURLY",
        value: currentCharacter,
      });

      currentPosition++;
      continue;
    }

    const SQUARE = /\[|\]/;

    if (SQUARE.test(currentCharacter)) {
      tokens.push({
        type: "SQUARE",
        value: currentCharacter,
      });

      currentPosition++;
      continue;
    }

    const COMMA = /,/;

    if (COMMA.test(currentCharacter)) {
      tokens.push({
        type: "COMMA",
        value: currentCharacter,
      });

      currentPosition++;
      continue;
    }

    const SEMICOLON = /;/;

    if (SEMICOLON.test(currentCharacter)) {
      tokens.push({
        type: "SEMICOLON",
        value: currentCharacter,
      });

      currentPosition++;
      continue;
    }

    const COLON = /:/;

    if (COLON.test(currentCharacter)) {
      tokens.push({
        type: "COLON",
        value: currentCharacter,
      });

      currentPosition++;
      continue;
    }

    const QUESTION = /\?/;

    if (QUESTION.test(currentCharacter)) {
      value = currentCharacter;
      let nextCharacter = input[currentPosition + 1];
      if (nextCharacter === ".") {
        value = currentCharacter + nextCharacter;
        tokens.push({
          type: "OPTIONAL_CHAINING",
          value: value,
        });
      } else if (currentCharacter === nextCharacter) {
        if (input[currentPosition + 2] === "=") {
          value = currentCharacter + nextCharacter + input[currentPosition + 2];
          tokens.push({
            type: "ASSIGNMENT_OP",
            value: value,
          });
        } else {
          value = currentCharacter + nextCharacter;
          tokens.push({
            type: "NULLISH_OP",
            value: value,
          });
        }
      } else {
        tokens.push({
          type: "QUESTION",
          value: value,
        });
      }

      currentPosition += value.length;
      continue;
    }

    const DOT = /\./;

    if (DOT.test(currentCharacter)) {
      let value = currentCharacter;
      let nextCharacter = input[currentPosition + 1];
      let nextnextCharacter = input[currentPosition + 2];
      if (value === nextCharacter && value === nextnextCharacter) {
        value += nextCharacter + nextnextCharacter;

        tokens.push({
          type: "SPREAD",
          value: value,
        });
      } else {
        tokens.push({
          type: "DOT",
          value: value,
        });
      }
      currentPosition += value.length;
      continue;
    }

    const WHITESPACE = /\s/;

    if (WHITESPACE.test(currentCharacter)) {
      currentPosition++;
      continue;
    }

    throw new SyntaxError(
      "Error at Position " +
      currentPosition +
      "; Symbol " +
      currentCharacter +
      " not known"
    );
  }

  currentPosition = 0;
  let currentToken = tokens[currentPosition];

  const KEYWORD = ["break", "case", "catch", "class", "const", "continue", "debugger", "default", "delete", "do", "else", "enum", "export", "extends", "finally", "for", "function", "if", "import", "in", "instanceof", "let", "new", "return", "super", "switch", "this", "throw", "try", "typeof", "var", "void", "while", "with", "yield"];

  while (currentPosition < tokens.length) {
    currentToken = tokens[currentPosition];
    if (KEYWORD.find(element => element === currentToken.value)) {
      currentToken.type = "KEYWORD";
    }
    currentPosition++;
  }

  currentPosition = 0;

  while (currentPosition < tokens.length) {
    currentToken = tokens[currentPosition];

    if ((tokens[currentPosition - 1] === undefined || tokens[currentPosition - 1].value !== "function") && tokens[currentPosition].type === "IDENTIFIER" && tokens[currentPosition + 1] && tokens[currentPosition + 1].value === "(") {
      currentToken.type = "FUNCTION_CALL";
    } else if (tokens[currentPosition - 1] && tokens[currentPosition - 1].value === "new" && tokens[currentPosition].type === "IDENTIFIER") {
      currentToken.type = "CONSTRUCTOR";
    }
    currentPosition++;
  }

  // Add bracket types for round brackets
  currentPosition = 0;
  let stack = [];

  while (currentPosition < tokens.length) {
    currentToken = tokens[currentPosition];

    if (tokens[currentPosition - 1] && tokens[currentPosition - 1].type === "CONSTRUCTOR" && currentToken.value === "(") {
      currentToken["bracket_type"] = "CONSTRUCTOR";
      stack.push("CONSTRUCTOR");
    } else if (tokens[currentPosition - 1] && tokens[currentPosition - 1].type === "FUNCTION_CALL" && currentToken.value === "(") {
      currentToken["bracket_type"] = "FUNCTION_CALL";
      stack.push("FUNCTION_CALL");
    } else if (currentToken.value === "(") {
      currentToken["bracket_type"] = "GROUPING";
      stack.push("GROUPING");
    } else if (currentToken.value === ")") {
      currentToken["bracket_type"] = stack.pop();
    }


    currentPosition++;
  }

  currentPosition = 0;

  while (currentPosition < tokens.length) {
    currentToken = tokens[currentPosition];

    if (currentToken.type === "STRING") {
      let temporaryString = "";
      temporaryString = temporaryString.concat("\"", currentToken.value, "\"");
      currentToken.value = temporaryString;
    }
    currentPosition++;
  }
  return tokens;
}

// This function implements the parser

function parse(tokens) {

  class Node {
    constructor(value, type) {
      this.value = value;
      this.type = type;
      this.next = [];
    }
  }

  class AbstractSyntaxTree {
    constructor() {
      this.root = new Node("PROGRAM", "DESCRIPTION");
    }
  }

  // Add a "prev" property to each node that points to the previous node
  function setPreviousProperty(node) {
    if (!node) {
      return;
    } else {
      for (let i = 0; i < node.next.length; i++) {
        node.next[i].prev = node;
        setPreviousProperty(node.next[i]);
      }
    }
  }

  function returnEndPositionOfStatement(tokens, startPositionOfStatement) {
    let pointer = startPositionOfStatement;
    if ((tokens[pointer].type === "KEYWORD" && (tokens[pointer].value === "let" || tokens[pointer].value === "var" || tokens[pointer].value === "const" || tokens[pointer].value === "return")) || tokens[pointer].type === "IDENTIFIER" || tokens[pointer].type === "FUNCTION_CALL" || tokens[pointer].value === "++" || tokens[pointer].value === "--") {
      while (tokens[pointer].value !== ";") {
        pointer++;
      }
      return pointer;
    } else if (tokens[pointer].type === "KEYWORD" && (tokens[pointer].value === "function" || tokens[pointer].value === "class" || tokens[pointer].value === "for" || tokens[pointer].value === "while" || tokens[pointer].value === "if")) {
      if (tokens[pointer].value === "if") {
        while (true) {
          while (tokens[pointer].value !== "{") {
            pointer++;
          }
          pointer = returnIndexOfClosingBracket(tokens, "CURLY", pointer);
          if (pointer === tokens.length - 1 || tokens[pointer + 1].value !== "else") {
            return pointer;
          }
        }
      }
      while (tokens[pointer].value !== "{") {
        pointer++;
      }
      pointer = returnIndexOfClosingBracket(tokens, "CURLY", pointer);
      return pointer;
    }
  }

  function addTokenPrecedence(tokens, startIndex, endIndex) {
    let precedence = 0;
    let temporaryPosition = startIndex;
    let tempCurrentToken = tokens[temporaryPosition];
    let stack = [];

    while (temporaryPosition <= endIndex) {
      tempCurrentToken = tokens[temporaryPosition];
      precedence = 0;
      if (tempCurrentToken.value === "(" && tempCurrentToken.bracket_type === "GROUPING") {
        precedence = 18;
        stack.push(precedence);
      } else if (tempCurrentToken.value === "(" && (tempCurrentToken.bracket_type === "FUNCTION_CALL" || tempCurrentToken.bracket_type === "CONSTRUCTOR")) {
        precedence = 17;
        stack.push(precedence);
      } else if (tempCurrentToken.value === ")") {
        precedence = stack.pop();
      } else if (tempCurrentToken.value === ".") {
        precedence = 17;
      } else if (tempCurrentToken.value === "[") {
        precedence = 17;
        stack.push(precedence);
      } else if (tempCurrentToken.value === "]") {
        precedence = stack.pop();
      } else if (tempCurrentToken.value === "new" && tokens[temporaryPosition + 2] && tokens[temporaryPosition + 2].bracket_type === "CONSTRUCTOR") {
        precedence = 17;
      } else if (tempCurrentToken.value === "?.") {
        precedence = 17;
      } else if (tempCurrentToken.value === "new") {
        precedence = 16;
      } else if ((tempCurrentToken.value === "++" || tempCurrentToken.value === "--") && tokens[temporaryPosition - 1] && (tokens[temporaryPosition - 1].type === "IDENTIFIER" || tokens[temporaryPosition - 1].value === ")")) {
        precedence = 15;
      } else if (tempCurrentToken.value === "!") {
        precedence = 14;
      } else if (tempCurrentToken.value === "~") {
        precedence = 14;
      } else if ((tempCurrentToken.value === "+" || tempCurrentToken.value === "-") && tokens[temporaryPosition - 1] && tokens[temporaryPosition - 1].type !== "NUMBER" && tokens[temporaryPosition - 1].type !== "IDENTIFIER" && tokens[temporaryPosition - 1].type !== "FUNCTION_CALL" && tokens[temporaryPosition - 1].value !== ")") {
        precedence = 14;
      } else if ((tempCurrentToken.value === "++" || tempCurrentToken.value === "--") && tokens[temporaryPosition + 1] && (tokens[temporaryPosition + 1].type === "IDENTIFIER" || tokens[temporaryPosition + 1].value === "(")) {
        precedence = 14;
      } else if (tempCurrentToken.value === "typeof") {
        precedence = 14;
      } else if (tempCurrentToken.value === "void") {
        precedence = 14;
      } else if (tempCurrentToken.value === "delete") {
        precedence = 14;
      } else if (tempCurrentToken.value === "await") {
        precedence = 14;
      } else if (tempCurrentToken.value === "**") {
        precedence = 13;
      } else if (tempCurrentToken.value === "*") {
        precedence = 12;
      } else if (tempCurrentToken.value === "/") {
        precedence = 12;
      } else if (tempCurrentToken.value === "%") {
        precedence = 12;
      } else if (tempCurrentToken.value === "+") {
        precedence = 11;
      } else if (tempCurrentToken.value === "-") {
        precedence = 11;
      } else if (tempCurrentToken.value === "<<") {
        precedence = 10;
      } else if (tempCurrentToken.value === ">>") {
        precedence = 10;
      } else if (tempCurrentToken.value === ">>>") {
        precedence = 10;
      } else if (tempCurrentToken.value === "<") {
        precedence = 9;
      } else if (tempCurrentToken.value === "<=") {
        precedence = 9;
      } else if (tempCurrentToken.value === ">") {
        precedence = 9;
      } else if (tempCurrentToken.value === ">=") {
        precedence = 9;
      } else if (tempCurrentToken.value === "in") {
        precedence = 9;
      } else if (tempCurrentToken.value === "instanceof") {
        precedence = 9;
      } else if (tempCurrentToken.value === "==") {
        precedence = 8;
      } else if (tempCurrentToken.value === "!=") {
        precedence = 8;
      } else if (tempCurrentToken.value === "===") {
        precedence = 8;
      } else if (tempCurrentToken.value === "!==") {
        precedence = 8;
      } else if (tempCurrentToken.value === "&") {
        precedence = 7;
      } else if (tempCurrentToken.value === "^") {
        precedence = 6;
      } else if (tempCurrentToken.value === "|") {
        precedence = 5;
      } else if (tempCurrentToken.value === "&&") {
        precedence = 4;
      } else if (tempCurrentToken.value === "||") {
        precedence = 3;
      } else if (tempCurrentToken.value === "??") {
        precedence = 3;
      } else if (tempCurrentToken.value === "?" || tempCurrentToken.value === ":") {
        precedence = 2;
      } else if (tempCurrentToken.value === "=") {
        precedence = 2;
      } else if (tempCurrentToken.value === "+=") {
        precedence = 2;
      } else if (tempCurrentToken.value === "-=") {
        precedence = 2;
      } else if (tempCurrentToken.value === "**=") {
        precedence = 2;
      } else if (tempCurrentToken.value === "*=") {
        precedence = 2;
      } else if (tempCurrentToken.value === "/=") {
        precedence = 2;
      } else if (tempCurrentToken.value === "%=") {
        precedence = 2;
      } else if (tempCurrentToken.value === "<<=") {
        precedence = 2;
      } else if (tempCurrentToken.value === ">>=") {
        precedence = 2;
      } else if (tempCurrentToken.value === ">>>=") {
        precedence = 2;
      } else if (tempCurrentToken.value === "&=") {
        precedence = 2;
      } else if (tempCurrentToken.value === "^=") {
        precedence = 2;
      } else if (tempCurrentToken.value === "|=") {
        precedence = 2;
      } else if (tempCurrentToken.value === "&&=") {
        precedence = 2;
      } else if (tempCurrentToken.value === "||=") {
        precedence = 2;
      } else if (tempCurrentToken.value === "??=") {
        precedence = 2;
      } else if (tempCurrentToken.value === "=>") {
        precedence = 2;
      } else if (tempCurrentToken.value === "yield") {
        precedence = 2;
      } else if (tempCurrentToken.value === "yield*") {
        precedence = 2;
      } else if (tempCurrentToken.value === "...") {
        precedence = 2;
      } else if (tempCurrentToken.value === ",") {
        precedence = 1;
      }

      tokens[temporaryPosition++]["precedence"] = precedence;
    }
  }

  function returnExpressionAsNodeArray(tokens, startOfExpression, endOfExpression) {
    addTokenPrecedence(tokens, startOfExpression, endOfExpression);

    let temporaryPosition = startOfExpression;
    let currentToken = tokens[temporaryPosition];
    let nodeArray = [];
    while (temporaryPosition <= endOfExpression) {
      let node = new Node(currentToken.value, currentToken.type);
      node.precedence = currentToken.precedence;
      if (currentToken.bracket_type) {
        node.bracket_type = currentToken.bracket_type;
      }
      nodeArray.push(node);
      currentToken = tokens[++temporaryPosition];
    }
    return nodeArray;
  }

  function returnExpressionAsNode(nodeArray) {
    while (true) {
      let maxPrecedencePosition = returnMaxPrecedence(nodeArray, 0, nodeArray.length - 1);
      connectExpressionNodes(nodeArray, maxPrecedencePosition);
      // Check if array has only one node with precedence 0 left and return that node
      let expressionNode;
      let amountOfNodesWithPrecedenceZero = 0;
      for (let i = 0; i < nodeArray.length; i++) {
        if (nodeArray[i].precedence === 0) {
          amountOfNodesWithPrecedenceZero++;
          expressionNode = nodeArray[i];
        }
      }
      if (amountOfNodesWithPrecedenceZero === 1) {
        return expressionNode;
      }
    }
  }

  function returnIndexOfClosingBracket(array, type, indexOfOpeningBracket) {
    let indexOfClosingBracket;
    const BRACKETS = {
      "PAR": ["(", ")"],
      "CURLY": ["{", "}"],
      "SQUARE": ["[", "]"]
    };

    let temporaryPosition = indexOfOpeningBracket;
    let tempCurrentToken = array[temporaryPosition];
    let stack = [];
    stack.push(tempCurrentToken.value);
    temporaryPosition++;

    while (stack.length > 0) {
      tempCurrentToken = array[temporaryPosition];
      if (tempCurrentToken.value === BRACKETS[type][0]) {
        stack.push(BRACKETS[type][0]);
      } else if (tempCurrentToken.value === BRACKETS[type][1]) {
        stack.pop();
      }

      if (stack.length > 0) {
        temporaryPosition++;
      }
    }

    indexOfClosingBracket = temporaryPosition;

    return indexOfClosingBracket;
  }

  function connectExpressionNodes(nodeArray, position) {
    // Binary Operators
    const BINARY_OPERATOR = ["*", "**", "+", "-", "/", "%", "&&", "||", "=", "+=", "-=", "*=", "**=", "/=", "%=", "&&=", "||=", "==", "!=", "===", "!==", "<", "<=", ">", ">=", ",", "."];
    // Unary Operators
    const UNARY_OPERATOR = ["++", "--", "!"];
    // Other
    const HYBRID_OPERATOR = ["new", "?", ":"];

    let node = nodeArray[position];

    if (BINARY_OPERATOR.includes(node.value) && node.precedence !== 14) {
      let leftOperandPosition = position;
      let rightOperandPosition = position;
      while (nodeArray[leftOperandPosition].precedence !== 0) {
        leftOperandPosition--;
      }
      while (nodeArray[rightOperandPosition].precedence !== 0) {
        rightOperandPosition++;
      }
      node.next.push(nodeArray[leftOperandPosition]);
      node.next.push(nodeArray[rightOperandPosition]);
      node.precedence = 0;
      nodeArray[leftOperandPosition].precedence = -1;
      nodeArray[rightOperandPosition].precedence = -1;

    } else if (UNARY_OPERATOR.includes(node.value)) {
      let operandPosition = position;
      while (nodeArray[operandPosition].precedence !== 0) {
        if (node.value === "!" || node.precedence === 14) {
          operandPosition++;
          if (node.precedence === 14) {
            node.fix = "left";
          }
        } else if (node.precedence === 15) {
          operandPosition--;
          node.fix = "right";
        }
      }
      node.next.push(nodeArray[operandPosition]);
      node.precedence = 0;
      nodeArray[operandPosition].precedence = -1;
    } else if (BINARY_OPERATOR.includes(node.value) && node.precedence === 14) {
      let operandPosition = position;
      while (nodeArray[operandPosition].precedence !== 0) {
        operandPosition++;
      }
      node.next.push(nodeArray[operandPosition]);
      node.precedence = 0;
      nodeArray[operandPosition].precedence = -1;
    } else if (node.precedence === 18) {
      let openingBracketPosition = position;
      let closingBracketPosition = returnIndexOfClosingBracket(nodeArray, "PAR", openingBracketPosition);
      nodeArray[openingBracketPosition].precedence = -1;
      nodeArray[closingBracketPosition].precedence = -1;
      let pointer = openingBracketPosition;
      while (nodeArray[pointer].bracket_type === "GROUPING") {
        pointer++;
      }
      if (!nodeArray[pointer].groupingOpenCount) {
        nodeArray[pointer].groupingOpenCount = 0;
      }
      nodeArray[pointer].groupingOpenCount += 1;
      pointer = closingBracketPosition;
      bracketCounter = 0;
      while (nodeArray[pointer].bracket_type !== "FUNCTION_CALL" && nodeArray[pointer].type !== "NUMBER" && nodeArray[pointer].type !== "IDENTIFIER" && nodeArray[pointer].type !== "STRING") {
        pointer--;
      }
      if (nodeArray[pointer].type === "NUMBER" || nodeArray[pointer].type === "IDENTIFIER" || nodeArray[pointer].type === "STRING") {
        if (!nodeArray[pointer].groupingCloseCount) {
          nodeArray[pointer].groupingCloseCount = 0;
        }
        nodeArray[pointer].groupingCloseCount += 1;
      } else if (nodeArray[pointer].bracket_type === "FUNCTION_CALL") {
        let bracketCount = 1;
        pointer--;
        while (bracketCount > 0) {
          if (nodeArray[pointer].bracket_type === "FUNCTION_CALL" && nodeArray[pointer].value === "(") {
            bracketCount--;
          } else if (nodeArray[pointer].bracket_type === "FUNCTION_CALL" && nodeArray[pointer].value === ")") {
            bracketCount++;
          }
          pointer--;
        }
        nodeArray[pointer].groupingCloseCount = 0;
        nodeArray[pointer].groupingCloseCount += 1;
      }

    } else if (node.precedence === 17 && node.value === "(") {
      let openingBracketPosition = position;
      let closingBracketPosition = returnIndexOfClosingBracket(nodeArray, "PAR", openingBracketPosition);
      let functionIdentifier = nodeArray[position - 1];
      nodeArray[openingBracketPosition].precedence = -1;
      nodeArray[closingBracketPosition].precedence = -1;
      if (node.emptyFunctionCall === true) {
        return;
      }

      let expressionNode;
      let amountOfNodesWithPrecedenceZero = 0;
      for (let i = openingBracketPosition; i <= closingBracketPosition; i++) {
        if (nodeArray[i].precedence === 0) {
          amountOfNodesWithPrecedenceZero++;
          expressionNode = nodeArray[i];
        }
      }
      if (amountOfNodesWithPrecedenceZero === 1) {
        functionIdentifier.next.push(expressionNode);
        expressionNode.precedence = -1;
      }
    } else if (node.precedence === 17 && node.value === "[") {
      if (nodeArray[position - 1] && nodeArray[position - 1].value === "=") {
        if (nodeArray[position + 1] && nodeArray[position + 1].value === "]") {
          node.array = "empty";
          node.precedence = 0;
          nodeArray[position + 1].precedence = -1;
        } else {
          let startOfBracket = position;
          let endOfBracket = returnIndexOfClosingBracket(nodeArray, "SQUARE", startOfBracket);
          while (true) {
            let maxPrecedence = returnMaxPrecedence(nodeArray, startOfBracket + 1, endOfBracket - 1)
            connectExpressionNodes(nodeArray, maxPrecedence);
            let numberOfNodesWithPrecedenceZero = 0;
            for (let i = startOfBracket + 1; i < endOfBracket; i++) {
              if (nodeArray[i].precedence === 0) {
                numberOfNodesWithPrecedenceZero++;
              }
            }
            if (numberOfNodesWithPrecedenceZero === 1) {
              nodeArray[startOfBracket].precedence = -1;
              nodeArray[endOfBracket].precedence = -1;
              return;
            }
          }

        }
      } else if (nodeArray[position - 1] && nodeArray[position - 1].type === "IDENTIFIER") {
        let startOfBracket = position;
        let endOfBracket = returnIndexOfClosingBracket(nodeArray, "SQUARE", startOfBracket);
        nodeArray[position - 1].next.push(nodeArray[startOfBracket + 1]);
        nodeArray[position - 1].access = true;
        nodeArray[startOfBracket].precedence = -1;
        nodeArray[endOfBracket].precedence = -1;
        nodeArray[startOfBracket + 1].precedence = -1;
      }
    }
  }

  function isFinishedWithBracket(nodeArray, startIndex, endIndex) {
    let nodePosition = -1;
    let amountOfNodesWithPrecedenceZero = 0;
    for (let i = startIndex; i <= endIndex; i++) {
      if (nodeArray[i].precedence === 0) {
        amountOfNodesWithPrecedenceZero++;
        nodePosition = i;
      }
    }
    if (amountOfNodesWithPrecedenceZero === 1) {
      return nodePosition;
    }
  }

  function returnMaxPrecedence(nodeArray, startIndex, endIndex) {
    let maxBracketCount = 0;
    let bracketCounter = 0;
    let position = startIndex;
    let maxPosition = startIndex;
    let node = nodeArray[position];
    let maxPrecedence = 0;
    let hasGrouping = false;
    let hasFunctionCall = false;

    for (let i = startIndex; i <= endIndex; i++) {
      if (nodeArray[i].value === "(" && nodeArray[i].precedence === 18) {
        position = i;
        maxPosition = i;
        hasGrouping = true;
        break;
      } else if (nodeArray[i].value === "(" && nodeArray[i].precedence === 17) {
        hasFunctionCall = true;
      }
    }

    if (hasGrouping) {
      while (position <= endIndex) {
        node = nodeArray[position];
        if (node.value === "(" && node.precedence === 18) {
          bracketCounter++;
          if (bracketCounter > maxBracketCount) {
            maxPosition = position;
          }
          maxBracketCount = Math.max(maxBracketCount, bracketCounter);
        } else if (node.value === ")" && node.precedence === 18) {
          bracketCounter--;
        }
        position++;
      }

      let openingBracketPosition = maxPosition;
      let closingBracketPosition = returnIndexOfClosingBracket(nodeArray, "PAR", openingBracketPosition);
      maxPosition = returnMaxPrecedence(nodeArray, openingBracketPosition + 1, closingBracketPosition - 1);
      if (isFinishedWithBracket(nodeArray, openingBracketPosition, closingBracketPosition)) {
        return openingBracketPosition;
      }
      return maxPosition;
    }

    if (hasFunctionCall) {
      while (position <= endIndex) {
        node = nodeArray[position];
        if (node.value === "(" && node.precedence === 17) {
          bracketCounter++;
          if (bracketCounter > maxBracketCount) {
            maxPosition = position;
          }
          maxBracketCount = Math.max(maxBracketCount, bracketCounter);
        } else if (node.value === ")" && node.precedence === 17) {
          bracketCounter--;
        }
        position++;
      }
      if (nodeArray[maxPosition + 1].value === ")" && nodeArray[maxPosition + 1].precedence === 17) {
        nodeArray[maxPosition].emptyFunctionCall = true;
        return maxPosition;
      }
      let openingBracketPosition = maxPosition;
      let closingBracketPosition = returnIndexOfClosingBracket(nodeArray, "PAR", openingBracketPosition);
      maxPosition = returnMaxPrecedence(nodeArray, openingBracketPosition + 1, closingBracketPosition - 1);
      if (isFinishedWithBracket(nodeArray, openingBracketPosition, closingBracketPosition)) {
        return openingBracketPosition;
      }
      return maxPosition;
    }

    while (position <= endIndex) {
      node = nodeArray[position];
      if (node.precedence > maxPrecedence) {
        maxPrecedence = node.precedence;
        maxPosition = position;
      }
      position++;
    }

    return maxPosition;
  }

  function returnStatementAsNode(tokens, startOfStatement, endOfStatement) {
    let pointer = startOfStatement;
    if (tokens[pointer].type === "KEYWORD" && (tokens[pointer].value === "let" || tokens[pointer].value === "const" || tokens[pointer].value === "var")) {
      let nodeArray = returnExpressionAsNodeArray(tokens, startOfStatement + 1, endOfStatement - 1);
      let variableDeclarationNode = new Node("VARIABLE_DECLARATION", "DESCRIPTION");
      let variableDeclarationKeyword = new Node(tokens[startOfStatement].value, tokens[startOfStatement].type);
      let variableDeclarationExpression = returnExpressionAsNode(nodeArray);
      variableDeclarationNode.next.push(variableDeclarationKeyword);
      variableDeclarationNode.next.push(variableDeclarationExpression);
      return variableDeclarationNode;
    } else if (tokens[pointer].type === "IDENTIFIER" || tokens[pointer].type === "FUNCTION_CALL" || ((tokens[pointer].value === "++" || tokens[pointer].value === "--") && tokens[pointer].precedence === 14)) {
      let nodeArray = returnExpressionAsNodeArray(tokens, startOfStatement, endOfStatement - 1);
      let statementNode = new Node("STATEMENT", "DESCRIPTION");
      let expressionNode = returnExpressionAsNode(nodeArray);
      statementNode.next.push(expressionNode);
      return statementNode;
    } else if (tokens[pointer].type === "KEYWORD" && tokens[pointer].value === "return") {
      let nodeArray = returnExpressionAsNodeArray(tokens, startOfStatement + 1, endOfStatement - 1);
      let returnStatementNode = new Node("RETURN_STATEMENT", "DESCRIPTION");
      let statementNode = returnExpressionAsNode(nodeArray);
      returnStatementNode.next.push(statementNode);
      return returnStatementNode;
    } else if (tokens[pointer].type === "KEYWORD" && tokens[pointer].value === "function") {
      let functionDeclarationNode = new Node("FUNCTION_DECLARATION", "DESCRIPTION");
      pointer++;
      let functionIdentifierNode = new Node(tokens[pointer].value, tokens[pointer].type);
      functionDeclarationNode.next.push(functionIdentifierNode);
      pointer++;
      let openingBracketPosition = pointer;
      let closingBracketPosition = returnIndexOfClosingBracket(tokens, "PAR", openingBracketPosition);
      let paramArray = returnExpressionAsNodeArray(tokens, openingBracketPosition + 1, closingBracketPosition - 1);
      let functionParameterNode = returnExpressionAsNode(paramArray);
      functionDeclarationNode.next.push(functionParameterNode);
      pointer = closingBracketPosition + 1;
      let functionBodyNode = new Node("FUNCTION_BODY", "DESCRIPTION");
      functionDeclarationNode.next.push(functionBodyNode);
      let startOfFunctionBody = pointer;
      let endOfFunctionBody = returnIndexOfClosingBracket(tokens, "CURLY", startOfFunctionBody);
      pointer++;
      let endOfStatement = returnEndPositionOfStatement(tokens, pointer);
      while (pointer < endOfFunctionBody) {
        functionBodyNode.next.push(returnStatementAsNode(tokens, pointer, endOfStatement));
        pointer = endOfStatement + 1;
        endOfStatement = returnEndPositionOfStatement(tokens, pointer);
      }
      return functionDeclarationNode;
    } else if (tokens[pointer].type === "KEYWORD" && (tokens[pointer].value === "for" || tokens[pointer].value === "while")) {
      if (tokens[pointer].value === "while") {
        let whileStatementNode = new Node("WHILE_STATEMENT", "DESCRIPTION");
        startOfCondition = pointer + 1;
        endOfCondition = returnIndexOfClosingBracket(tokens, "PAR", startOfCondition);
        let nodeArray = returnExpressionAsNodeArray(tokens, startOfCondition + 1, endOfCondition - 1);
        let conditionNode = returnExpressionAsNode(nodeArray);
        whileStatementNode.next.push(conditionNode);
        pointer = endOfCondition + 1;
        let whileBodyNode = new Node("WHILE_BODY", "DESCRIPTION");
        whileStatementNode.next.push(whileBodyNode);
        let startOfWhileBody = pointer;
        let endOfWhileBody = returnIndexOfClosingBracket(tokens, "CURLY", startOfWhileBody);
        pointer++;
        let endOfStatement = returnEndPositionOfStatement(tokens, pointer);
        while (pointer < endOfWhileBody) {
          whileBodyNode.next.push(returnStatementAsNode(tokens, pointer, endOfStatement));
          pointer = endOfStatement + 1;
          endOfStatement = returnEndPositionOfStatement(tokens, pointer);
        }
        return whileStatementNode;
      } else if (tokens[pointer].value === "for") {
        let forStatementNode = new Node("FOR_STATEMENT", "DESCRIPTION");
        let startOfOptionalStatements = pointer + 1;
        let endOfOptionalStatements = returnIndexOfClosingBracket(tokens, "PAR", startOfOptionalStatements);
        let startOfInitialization = startOfOptionalStatements + 1;
        let endOfInitialization;
        let initializationNode;
        if (tokens[startOfInitialization].value === ";") {
          initializationNode = null;
        } else {
          endOfInitialization = returnEndPositionOfStatement(tokens, startOfInitialization);
          initializationNode = returnStatementAsNode(tokens, startOfInitialization, endOfInitialization);
        }
        forStatementNode.next.push(initializationNode);
        pointer = startOfInitialization;
        while (tokens[pointer].value !== ";") {
          pointer++;
        }
        let startOfCondition = pointer + 1;
        let endOfCondition;
        let conditionNode;
        if (tokens[startOfCondition].value === ";") {
          conditionNode = null;
        } else {
          endOfCondition = returnEndPositionOfStatement(tokens, startOfCondition);
          let nodeArray = returnExpressionAsNodeArray(tokens, startOfCondition, endOfCondition - 1);
          conditionNode = returnExpressionAsNode(nodeArray);
        }
        forStatementNode.next.push(conditionNode);
        pointer = startOfCondition;
        while (tokens[pointer].value !== ";") {
          pointer++;
        }
        let startOfAfterthought = pointer + 1;
        let endOfAfterthought;
        let afterthoughtNode;
        if (startOfAfterthought === endOfOptionalStatements) {
          afterthoughtNode = null;
        } else {
          endOfAfterthought = endOfOptionalStatements - 1;
          let nodeArray = returnExpressionAsNodeArray(tokens, startOfAfterthought, endOfAfterthought);
          afterthoughtNode = returnExpressionAsNode(nodeArray);
        }
        forStatementNode.next.push(afterthoughtNode);
        let forBodyNode = new Node("FOR_BODY", "DESCRIPTION");
        forStatementNode.next.push(forBodyNode);
        while (tokens[pointer].value !== "{") {
          pointer++;
        }
        let startOfForBody = pointer;
        let endOfForBody = returnIndexOfClosingBracket(tokens, "CURLY", startOfForBody);
        pointer++;
        let endOfStatement = returnEndPositionOfStatement(tokens, pointer);
        while (pointer < endOfForBody) {
          forBodyNode.next.push(returnStatementAsNode(tokens, pointer, endOfStatement));
          pointer = endOfStatement + 1;
          endOfStatement = returnEndPositionOfStatement(tokens, pointer);
        }
        return forStatementNode;
      }
    } else if (tokens[pointer].type === "KEYWORD" && tokens[pointer].value === "if") {
      let endIndex = returnEndPositionOfStatement(tokens, pointer);
      let ifStatementNode = new Node("IF_STATEMENT", "DESCRIPTION");
      startOfCondition = pointer + 1;
      endOfCondition = returnIndexOfClosingBracket(tokens, "PAR", startOfCondition);
      let nodeArray = returnExpressionAsNodeArray(tokens, startOfCondition + 1, endOfCondition - 1);
      let conditionNode = returnExpressionAsNode(nodeArray);
      ifStatementNode.next.push(conditionNode);
      pointer = endOfCondition + 1;
      let ifBodyNode = new Node("IF_BODY", "DESCRIPTION");
      ifStatementNode.next.push(ifBodyNode);
      let startOfifBody = pointer;
      let endOfifBody = returnIndexOfClosingBracket(tokens, "CURLY", startOfifBody);
      pointer++;
      let endOfStatement = returnEndPositionOfStatement(tokens, pointer);
      while (pointer < endOfifBody) {
        ifBodyNode.next.push(returnStatementAsNode(tokens, pointer, endOfStatement));
        pointer = endOfStatement + 1;
        endOfStatement = returnEndPositionOfStatement(tokens, pointer);
      }
      if (pointer === tokens.length - 1 || tokens[pointer + 1].value !== "else") {
        return ifStatementNode;
      }
      while (pointer < endIndex) {
        if (tokens[pointer + 1].value === "else" && tokens[pointer + 2].value === "if") {
          let elseIfStatementNode = new Node("ELSE_IF_STATEMENT", "DESCRIPTION");
          ifStatementNode.next.push(elseIfStatementNode);
          startOfCondition = pointer + 3;
          endOfCondition = returnIndexOfClosingBracket(tokens, "PAR", startOfCondition);
          nodeArray = returnExpressionAsNodeArray(tokens, startOfCondition + 1, endOfCondition - 1);
          conditionNode = returnExpressionAsNode(nodeArray);
          elseIfStatementNode.next.push(conditionNode);
          pointer = endOfCondition + 1;
          ifBodyNode = new Node("IF_BODY", "DESCRIPTION");
          elseIfStatementNode.next.push(ifBodyNode);
          startOfifBody = pointer;
          endOfifBody = returnIndexOfClosingBracket(tokens, "CURLY", startOfifBody);
          pointer++;
          endOfStatement = returnEndPositionOfStatement(tokens, pointer);
          while (pointer < endOfifBody) {
            ifBodyNode.next.push(returnStatementAsNode(tokens, pointer, endOfStatement));
            pointer = endOfStatement + 1;
            endOfStatement = returnEndPositionOfStatement(tokens, pointer);
          }
          pointer = endOfifBody;
        }
        if (tokens[pointer + 1].value === "else" && tokens[pointer + 2].value !== "if") {
          let elseStatementNode = new Node("ELSE_STATEMENT", "DESCRIPTION");
          ifStatementNode.next.push(elseStatementNode);
          pointer += 2;
          startOfElseBody = pointer;
          endOfElseBody = returnIndexOfClosingBracket(tokens, "CURLY", startOfElseBody);
          pointer++;
          endOfStatement = returnEndPositionOfStatement(tokens, pointer);
          while (pointer < endOfElseBody) {
            elseStatementNode.next.push(returnStatementAsNode(tokens, pointer, endOfStatement));
            pointer = endOfStatement + 1;
            endOfStatement = returnEndPositionOfStatement(tokens, pointer);
          }
          pointer = endOfElseBody;
          return ifStatementNode;
        }
      }
    }
  }

  // Driver function for the parser
  function traverse(tokens) {
    const tree = new AbstractSyntaxTree();
    let currentPosition = 0;
    let endOfStatement = returnEndPositionOfStatement(tokens, currentPosition);
    while (currentPosition < tokens.length) {
      tree.root.next.push(returnStatementAsNode(tokens, currentPosition, endOfStatement));
      currentPosition = endOfStatement + 1;
      if (currentPosition < tokens.length) {
        endOfStatement = returnEndPositionOfStatement(tokens, currentPosition);
      }
    }
    setPreviousProperty(tree.root);
    return tree;
  }
  return traverse(tokens);
}

// This function implements the transformer

function transform(node) {

  class Node {
    constructor(value, type) {
      this.value = value;
      this.type = type;
      this.next = [];
    }
  }

  let generatedString = "";

  function generateString(node) {
    if (!node) {
      return;
    } else {
      generateString(node.next[0]);
      generatedString = generatedString.concat(node.value, " ");
      generateString(node.next[1]);
    }
  }

  function returnParams(paramsNode) {
    if (!paramsNode) {
      return;
    } else {
      returnParams(paramsNode.next[0]);
      if (paramsNode.value === ",") {
        generatedString = generatedString.concat(paramsNode.value, " ");
      } else {
        generatedString = generatedString.concat(paramsNode.value);
      }
      returnParams(paramsNode.next[1]);
    }
  }

  function returnAccess(paramsNode) {
    if (!paramsNode) {
      return;
    } else {
      returnAccess(paramsNode.next[0]);
      generatedString = generatedString.concat(paramsNode.value);
      returnAccess(paramsNode.next[1]);
    }
  }

  function transformFunctionCall(node) {
    if (!node) {
      return;
    } else {
      let currentNode = node;
      if (currentNode.type === "FUNCTION_CALL") {
        returnParams(currentNode.next[0]);
        generatedString = generatedString.trim();
        let args = generatedString;
        let identifier = currentNode.value;
        generatedString = "";
        let statement = "";
        statement = statement.concat(identifier, "(", args, ")");
        currentNode.value = statement;
        currentNode.next = [];
      }

      for (let i = 0; i < node.next.length; i++) {
        transformFunctionCall(node.next[i]);
      }
    }
  }

  function transformAccess(node) {
    if (!node) {
      return;
    } else {
      let currentNode = node;
      if (currentNode.value === ".") {
        returnAccess(currentNode);
        generatedString = generatedString.trim();
        let statement = generatedString;
        generatedString = "";

        if (statement.includes("console.log")) {
          statement = statement.replace("console.log", "print");
        }

        currentNode.value = statement;
        currentNode.next = [];
      }

      for (let i = 0; i < node.next.length; i++) {
        transformAccess(node.next[i]);
      }
    }
  }

  // Driver function for the transformer
  function traverse(node) {
    if (!node) {
      return;
    } else {
      let currentNode = node;
      if (currentNode.value === "VARIABLE_DECLARATION") {
        if (currentNode.next[0].value === "const") {
          currentNode.next[1].next[0].value = currentNode.next[1].next[0].value.toUpperCase();
        }
      } else if (currentNode.value === "FOR_STATEMENT") {
        let variableNode = new Node(currentNode.next[0].next[1].next[0].value, "IDENTIFIER");
        generateString(currentNode.next[0].next[1].next[1]);
        generatedString = generatedString.trim();
        let rangeStart = generatedString;
        generatedString = "";
        let variableRangeStart = new Node(rangeStart, "RANGE_START");
        generateString(currentNode.next[1].next[1]);
        generatedString = generatedString.trim();
        let rangeEnd = generatedString;
        generatedString = "";
        let variableRangeEnd = new Node(rangeEnd, "RANGE_END");
        let variableOperator = new Node(currentNode.next[1].value, "OPERATOR");
        if (variableOperator.value === "<=") {
          variableRangeEnd.value = variableRangeEnd.value.concat(" + 1");
        }
        currentNode.next[0] = variableNode;
        currentNode.next[0].prev = currentNode;
        currentNode.next[1] = variableRangeStart;
        currentNode.next[1].prev = currentNode;
        currentNode.next[1].next.push(variableRangeEnd);
        currentNode.next[1].next[0].prev = currentNode;
        if (currentNode.next[2].value === "++") {
          currentNode.next[2] = new Node("1", "STEP_COUNT");
          currentNode.next[2].prev = currentNode;
        } else if (currentNode.next[2].value === "+=") {
          let stepCount = currentNode.next[2].next[1].value;
          currentNode.next[2] = new Node(stepCount, "STEP_COUNT");
          currentNode.next[2].prev = currentNode;
        }
      }

      for (let i = 0; i < node.next.length; i++) {
        traverse(node.next[i]);
      }
    }
  }
  transformFunctionCall(node);
  transformAccess(node);
  traverse(node);
}

// This function implements the generator

function generate(node) {
  let code = "";
  let generatedString = "";

  function generateString(node) {
    if (!node) {
      return;
    } else {
      generateString(node.next[0]);
      if (node.groupingOpenCount || node.groupingCloseCount) {
        if (node.groupingOpenCount) {
          for (let i = 0; i < node.groupingOpenCount; i++) {
            generatedString = generatedString.concat("(");
          }
          generatedString = generatedString.concat(node.value, " ");
        } else if (node.groupingCloseCount) {
          generatedString = generatedString.concat(node.value);
          for (let i = 0; i < node.groupingCloseCount; i++) {
            generatedString = generatedString.concat(")");
          }
          generatedString = generatedString.concat(" ");
        }
      } else {
        generatedString = generatedString.concat(node.value, " ");
      }
      generateString(node.next[1]);
    }
  }

  function setLevels(node) {
    if (!node) {
      return;
    } else {
      if (!node.level) {
        node.level = 0;
      }
      let pointer = node;
      while (pointer.value !== 'PROGRAM') {
        pointer = pointer.prev;
        if (pointer.value === "FUNCTION_BODY" || pointer.value === "FOR_BODY" || pointer.value === "WHILE_BODY" || pointer.value === "IF_BODY" || pointer.value === "ELSE_STATEMENT") {
          node.level++;
        }
      }

      for (let i = 0; i < node.next.length; i++) {
        setLevels(node.next[i]);
      }
    }
  }

  function generateWhitespace(level) {
    let whitespace = "";
    for (let i = 0; i < level; i++) {
      whitespace = whitespace.concat("  ");
    }
    return whitespace;
  }

  function returnParams(paramsNode) {
    if (!paramsNode) {
      return;
    } else {
      returnParams(paramsNode.next[0]);
      if (paramsNode.value === ",") {
        generatedString = generatedString.concat(paramsNode.value, " ");
      } else {
        generatedString = generatedString.concat(paramsNode.value);
      }
      returnParams(paramsNode.next[1]);
    }
  }

  // Driver function for the generator
  function generateCode(node) {
    if (!node) {
      return;
    } else {
      let currentNode = node;
      if (currentNode.value === "VARIABLE_DECLARATION") {
        let whitespace = generateWhitespace(currentNode.next[0].level);
        let identifier = currentNode.next[1].next[0].value;
        let assignmentOperator = currentNode.next[1].value;
        generateString(currentNode.next[1].next[1]);
        generatedString = generatedString.trim();
        let expression = generatedString;
        generatedString = "";
        let variableDeclaration = "";
        variableDeclaration = variableDeclaration.concat(whitespace, identifier, " ", assignmentOperator, " ", expression, "\n");
        code = code.concat(variableDeclaration);
      } else if (currentNode.value === "FUNCTION_DECLARATION") {
        let whitespace = generateWhitespace(currentNode.next[0].level);
        returnParams(currentNode.next[1]);
        let params = generatedString;
        generatedString = "";
        let definitionLine = "";
        definitionLine = definitionLine.concat(whitespace, "def", " ", currentNode.next[0].value, "(", params, ")", ":", "\n");
        code = code.concat(definitionLine);
      } else if (currentNode.value === "RETURN_STATEMENT") {
        let whitespace = generateWhitespace(currentNode.next[0].level);
        generateString(currentNode.next[0]);
        generatedString = generatedString.trim();
        let expression = generatedString;
        generatedString = "";
        let returnStatement = "";
        returnStatement = returnStatement.concat(whitespace, "return", " ", expression, "\n");
        code = code.concat(returnStatement);
      } else if (currentNode.value === "IF_STATEMENT" || currentNode.value === "ELSE_IF_STATEMENT" || currentNode.value === "ELSE_STATEMENT") {
        let whitespace = generateWhitespace(currentNode.next[0].level);
        generateString(currentNode.next[0]);
        generatedString = generatedString.trim();
        let condition = "";
        condition = condition.concat(generatedString);
        generatedString = "";
        if (currentNode.value === "IF_STATEMENT") {
          let ifLine = "";
          ifLine = ifLine.concat(whitespace, "if", " ", condition, ":", "\n");
          code = code.concat(ifLine);
        } else if (currentNode.value === "ELSE_IF_STATEMENT") {
          let elifLine = "";
          elifLine = elifLine.concat(whitespace, "elif", " ", condition, ":", "\n");
          code = code.concat(elifLine);
        } else if (currentNode.value === "ELSE_STATEMENT") {
          whitespace = generateWhitespace(currentNode.level);
          let elseLine = "";
          elseLine = elseLine.concat(whitespace, "else", ":", "\n");
          code = code.concat(elseLine);
        }
      } else if (currentNode.value === "FOR_STATEMENT") {
        let whitespace = generateWhitespace(currentNode.next[0].level);
        let identifier = currentNode.next[0].value;
        let rangeStart = currentNode.next[1].value;
        let rangeEnd = currentNode.next[1].next[0].value;
        let stepCount = currentNode.next[2].value;
        let range = "";
        if (stepCount === "1") {
          range = range.concat("(", rangeStart, ", ", rangeEnd, ")");
        } else {
          range = range.concat("(", rangeStart, ", ", rangeEnd, ", ", stepCount, ")");
        }
        let forLine = "";
        forLine = forLine.concat(whitespace, "for", " ", identifier, " ", "in", " ", "range", range, ":", "\n");
        code = code.concat(forLine);
      } else if (currentNode.value === "WHILE_STATEMENT") {
        let whitespace = generateWhitespace(currentNode.next[0].level);
        generateString(currentNode.next[0]);
        generatedString = generatedString.trim();
        let condition = "";
        condition = condition.concat(generatedString);
        generatedString = "";
        let whileLine = "";
        whileLine = whileLine.concat(whitespace, "while", " ", condition, ":", "\n");
        code = code.concat(whileLine);
      } else if (currentNode.value === "STATEMENT") {
        if (currentNode.next[0].fix) {
          let identifier = currentNode.next[0].next[0].value;
          let statement = "";
          if (currentNode.next[0].fix === "left") {
            statement = statement.concat(currentNode.next[0].value, identifier);
          } else if (currentNode.next[0].fix === "right") {
            statement = statement.concat(identifier, currentNode.next[0].value);
          }
          currentNode.next[0].value = statement;
          currentNode.next[0].type = "STATEMENT";
          currentNode.next[0].next = [];
        }
        let whitespace = generateWhitespace(currentNode.next[0].level);
        generateString(currentNode.next[0]);
        generatedString = generatedString.trim();
        let statement = generatedString;
        generatedString = "";
        code = code.concat(whitespace, statement, "\n");
      }

      for (let i = 0; i < node.next.length; i++) {
        generateCode(node.next[i]);
      }
    }
  }
  setLevels(node);
  generateCode(node);
  return code;
}

// Driver function for the compiler
function compile(input) {
  let tokens = tokenize(input);
  let abstractSyntaxTree = parse(tokens);
  transform(abstractSyntaxTree.root);
  let output = generate(abstractSyntaxTree.root);

  return output;
}
