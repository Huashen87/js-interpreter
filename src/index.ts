import rl from 'readline';
import fs from 'fs';
import Interpreter from './interpreter';
import Lexer from './lexer';
import Parser from './parser';

const interpreter = new Interpreter();

const interpret = (text: string): any[] => {
  const lexer = new Lexer(text);
  const parser = new Parser(lexer);

  return interpreter.interpret(parser);
};

const lineReader = rl.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const readline = () => {
  lineReader.question(`\x1b[33m\x1b[1m${'js> '}\x1b[0m`, (line) => {
    try {
      const results = interpret(line + '\n');
      results.forEach((result) => {
        if (typeof result === 'string') result = `'${result}'`;
        console.log(`\x1b[36m\x1b[1m${result}\x1b[0m`);
      });
    } catch ({ name, message }) {
      console.log(`${name}: ${message}`);
    }
    readline();
  });
};

if (process.argv.length === 2) readline();
else if (process.argv.length === 3) {
  const buffer = fs.readFileSync(process.argv[2]);
  interpret(buffer.toString());
  process.exit(0);
} else throw new Error('Wrong number of argument');
