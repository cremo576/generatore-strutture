const { buildGeneratedFromPumps } = require('./index');

// Test per la funzione buildGeneratedFromPumps
const testPumps = [
  { nome: 'Pompa1', indirizzo: '1000,0' },
  { nome: 'Pompa2', indirizzo: '2000,0' }
];

const STRUCTURE_TEMPLATES = {
  pump_inv: [
    { suffix: '.Command.Automatic', type: 'Bool', access: 'R/W', comment: 'Comando modalità automatica' },
    { suffix: '.Command.Manual', type: 'Bool', access: 'R/W', comment: 'Comando modalità manuale' }
  ]
};

global.STRUCTURE_TEMPLATES = STRUCTURE_TEMPLATES;

global.addressFromSequence = (baseRaw, seqKey, idx) => {
  const base = parseInt(baseRaw.split(',')[0], 10);
  return `${base + idx},0`;
};

global.computeAddress = (base, offset) => {
  const baseWord = parseInt(base.split(',')[0], 10);
  return `${baseWord + offset},0`;
};

const result = buildGeneratedFromPumps(testPumps);

console.log('Risultato flat:', result.flat);
console.log('Risultato aoa:', result.aoa);