import rl from 'readline';
import Interpreter from './interpreter';
import Lexer from './lexer';
import Parser from './parser';

const lineReader = rl.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const readline = () => {
  lineReader.question(`\x1b[33m\x1b[1m${'js> '}\x1b[0m`, (line) => {
    const lexer = new Lexer(line);
    const parser = new Parser(lexer);
    const interpreter = new Interpreter(parser);

    const results = interpreter.interprete();
    results.forEach((result) => console.log(`\x1b[36m\x1b[1m${result}\x1b[0m`));
    readline();
  });
};

readline();
