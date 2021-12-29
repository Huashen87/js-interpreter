import rl from 'readline';
import fs from 'fs';
import Interpreter from './interpreter';
import Lexer from './lexer';
import Parser from './parser';
import { TT } from './token';

const interpreteAndPrintResult = (text: string) => {
  const lexer = new Lexer(text);
  const parser = new Parser(lexer);
  const interpreter = new Interpreter(parser);

  const results = interpreter.interprete();
  results.forEach((result) => console.log(`\x1b[36m\x1b[1m${result}\x1b[0m`));
};

const lineReader = rl.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const readline = () => {
  lineReader.question(`\x1b[33m\x1b[1m${'js> '}\x1b[0m`, (line) => {
    interpreteAndPrintResult(line);
    readline();
  });
};

if (process.argv.length === 2) readline();
if (process.argv.length === 3) {
  const buffer = fs.readFileSync(process.argv[2]);
  interpreteAndPrintResult(buffer.toString());
  process.exit(0);
} else throw new Error('Wrong number of argument');
