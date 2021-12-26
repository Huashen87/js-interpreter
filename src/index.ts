import rl from 'readline';

const lineReader = rl.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const readline = () => {
  lineReader.question(`\x1b[33m\x1b[1m${'js> '}\x1b[0m`, (line) => {
    console.log(`\x1b[36m\x1b[1m${line}\x1b[0m`);
    readline();
  });
};

readline();
