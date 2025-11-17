const { useState, useEffect } = React;
// Correggiamo l'uso delle icone Lucide
const { createIcons, icons } = lucide;
// Inizializziamo le icone
createIcons();

// Global error handlers to surface runtime errors (helps debugging "pagina bianca")
window.addEventListener('error', (e) => {
  console.error('Runtime error catturato:', e.error || e.message, e);
  try {
    // show a visible alert so the user notices
    alert('Errore runtime: ' + (e.error && e.error.message ? e.error.message : e.message));
  } catch (err) {
    // ignore
  }
});
window.addEventListener('unhandledrejection', (ev) => {
  console.error('Unhandled promise rejection:', ev.reason);
  try { alert('Unhandled promise rejection: ' + (ev.reason && ev.reason.message ? ev.reason.message : String(ev.reason))); } catch (err) {}
});

const PumpStructureGenerator = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [componentType, setComponentType] = useState('pump');
  const [hasInverter, setHasInverter] = useState(false);
  const [tableData, setTableData] = useState('');
  const [structure, setStructure] = useState([]);
  const [templateHeader, setTemplateHeader] = useState(null);
  const [templateRows, setTemplateRows] = useState(null);
  const [exportFilename, setExportFilename] = useState('Struttura');
  const [exportFilenameEdited, setExportFilenameEdited] = useState(false);

  // Prova a caricare il file ListModel.xlsx presente nella cartella (se l'app è servita)
  useEffect(() => {
    // Nota: non preimpostiamo più `exportFilename` qui per lasciare il campo
    // visivamente vuoto/trasparente se l'utente non vuole inserirlo.
    // Il nome di default usato durante l'export sarà 'struttura'.

    // Miglioro la funzione tryLoadTemplate per gestire meglio il caricamento del file Excel
    const tryLoadTemplate = async () => {
      try {
        console.log('[DEBUG] Tentativo di caricamento del file ListModel.xlsx');
        const res = await fetch('ListModel.xlsx');
        if (!res.ok) throw new Error(`Errore nel caricamento del file: ${res.status} ${res.statusText}`);

        const ab = await res.arrayBuffer();
        const wb = XLSX.read(ab, { type: 'array' });
        const first = wb.Sheets[wb.SheetNames[0]];
        const aoa = XLSX.utils.sheet_to_json(first, { header: 1, raw: false });

        if (aoa && aoa.length > 1) {
          setTemplateHeader(aoa[0]);
          const rows = [];
          for (let i = 1; i < aoa.length; i++) {
            const r = aoa[i];
            const allEmpty = r.every(cell => cell === undefined || String(cell).trim() === '');
            if (allEmpty) break;
            rows.push(r.map(c => (c === undefined ? '' : String(c))));
          }
          if (rows.length > 0) setTemplateRows(rows);
          console.log('[DEBUG] Template caricato con successo', { header: aoa[0], rows });
        } else {
          console.warn('[DEBUG] Il file Excel è vuoto o non valido');
        }
      } catch (err) {
        console.error('[DEBUG] Errore durante il caricamento del file Excel:', err);
        alert('Errore durante il caricamento del file Excel. Assicurati che il file sia presente e valido.');
      }
    };

    tryLoadTemplate();
  }, []);

  // Helper per calcolare correttamente gli indirizzi nel formato "word,bit".
  // See comments in index.html for detailed rules.
  const computeAddress = (base, offset = 0, explicitBit = null, preferExplicit = false) => {
    let baseWord = 0;
    let baseBit = 0;
    if (typeof base === 'string' && base.indexOf(',') >= 0) {
      const parts = base.split(',');
      baseWord = parseInt(parts[0].trim(), 10) || 0;
      baseBit = parseInt(parts[1].trim(), 10) || 0;
    } else {
      baseWord = parseInt(String(base || 0), 10) || 0;
      baseBit = 0;
    }

    const offNum = Number(offset) || 0;
    const wordDelta = Math.floor(offNum);
    const frac = Math.abs(offNum - wordDelta);
    let bitFromOffset = null;
    if (frac > 0.00001) {
      bitFromOffset = Math.round(frac * 10);
    }

    let word = baseWord + wordDelta;
    let bit = null;
    // preferExplicit=true => explicitBit prende priorità, altrimenti fraction-wins
    if (preferExplicit && explicitBit !== null && explicitBit !== undefined) {
      bit = explicitBit;
    } else if (bitFromOffset !== null) {
      bit = bitFromOffset;
    } else if (explicitBit !== null && explicitBit !== undefined) {
      bit = explicitBit;
    } else {
      bit = baseBit;
    }

    if (bit >= 16) {
      const carry = Math.floor(bit / 16);
      word += carry;
      bit = bit % 16;
    }

    return `${word},${bit}`;
  };

  // Sequenze desiderate: valori da sommare all'indirizzo iniziale importato.
  // Questi valori vengono sommati al baseRaw per ottenere l'indirizzo finale.
  const ADDRESS_SEQUENCES = {
    'pump_inv': [
      '256,0','256,1','256,3','258,0','266,0','266,2','266,3','266,4','266,5','268,0','272,0','276,0','280,0','300,0','302,0','306,0','310,0','314,0'
    ],
    'pump_noinv': [
      '256,0','256,1','256,3','266,0','266,2','266,3','266,4','266,5','300,0','302,0','306,0','310,0','314,0'
    ],
    'valve_inv': [
      '256,0','256,1','256,3','258,0','266,0','266,2','266,3','266,4','266,5','268,0','272,0','276,0'
    ],
    'valve_noinv': [
      '256,0','256,1','256,3','266,0','266,2','266,3','266,4','266,5','300,0','302,0','306,0','310,0','314,0'
    ]
  };

  const parseAddr = (s) => {
    if (!s || typeof s !== 'string') return { word: 0, bit: 0 };
    const p = s.split(',');
    return { word: parseInt(p[0], 10) || 0, bit: parseInt(p[1], 10) || 0 };
  };

  // TEMPLATE DELLE STRUTTURE: definisce ordine, tipi e metadati dei campi
  // per ciascuna combinazione device+inverter. L'indirizzo viene calcolato
  // facendo baseRaw + ADDRESS_SEQUENCES[seqKey][idx]
  const STRUCTURE_TEMPLATES = {
    'pump_inv': [
      { suffix: '.Command.Atomatic', type: 'Bool', access: 'R/W', comment: 'Comando modalità automatica' },
      { suffix: '.Command.Manual', type: 'Bool', access: 'R/W', comment: 'Comando modalità manuale' },
      { suffix: '.Command.Cmd_Man', type: 'Bool', access: 'R/W', comment: 'Comando start manuale' },
      { suffix: '.Command.Cmd_Man_Open', type: 'Bool', access: 'R/W', comment: 'Comando manuale Apertura' },
      { suffix: '.Command.Cmd_Man_Close', type: 'Bool', access: 'R/W', comment: 'Comando manuale Chiusura' },
      { suffix: '.Status.Ready', type: 'Bool', access: 'R', comment: 'Utenza pronta' },
      { suffix: '.Status.Opening', type: 'Bool', access: 'R', comment: 'Utenza in apertura' },
      { suffix: '.Status.Closing', type: 'Bool', access: 'R', comment: 'Utenza in chiusura' },
      { suffix: '.Status.Automatic', type: 'Bool', access: 'R', comment: 'Utenza in modalità automatica' },
      { suffix: '.Status.Manual', type: 'Bool', access: 'R', comment: 'Utenza in modalità manuale' },
      { suffix: '.Status.Selector', type: 'Bool', access: 'R', comment: 'Selettore utenza in remoto' },
      { suffix: '.Status.Open', type: 'Bool', access: 'R', comment: 'Utenza aperta' },
      { suffix: '.Status.Close', type: 'Bool', access: 'R', comment: 'Utenza chiusa' },
      { suffix: '.Worktime.Reset', type: 'Bool', access: 'R/W', comment: 'Comando reset ore parziali utenza' },
      { suffix: '.Worktime.Total.Hour', type: 'Dint', access: 'R', comment: 'Ore totali', rawMin: 0, rawMax: 9999999, unit: 'Min', scalaMin: 0, scalaMax: 9999999 },
  { suffix: '.Worktime.Total.Min', type: 'Int', access: 'R', comment: 'Minuti totali', rawMin: 0, rawMax: 59, unit: 'Min', scalaMin: 0, scalaMax: 59 },
      { suffix: '.Worktime.Partial.Hour', type: 'Dint', access: 'R', comment: 'Ore Parziali', rawMin: 0, rawMax: 9999999, unit: 'Min', scalaMin: 0, scalaMax: 9999999 },
  { suffix: '.Worktime.Partial.Min', type: 'Int', access: 'R', comment: 'Minuti Parziali', rawMin: 0, rawMax: 59, unit: 'Min', scalaMin: 0, scalaMax: 59 }
    ],
    'pump_noinv': [
      { suffix: '.Command.Atomatic', type: 'Bool', access: 'R/W', comment: 'Comando modalità automatica' },
      { suffix: '.Command.Manual', type: 'Bool', access: 'R/W', comment: 'Comando modalità manuale' },
      { suffix: '.Command.Cmd_Man', type: 'Bool', access: 'R/W', comment: 'Comando start manuale' },
      { suffix: '.Status.Ready', type: 'Bool', access: 'R', comment: 'Utenza pronta' },
      { suffix: '.Status.Running', type: 'Bool', access: 'R', comment: 'Utenza in marcia' },
      { suffix: '.Status.Automatic', type: 'Bool', access: 'R', comment: 'Utenza in modalità automatica' },
      { suffix: '.Status.Manual', type: 'Bool', access: 'R', comment: 'Utenza in modalità manuale' },
      { suffix: '.Status.Selector', type: 'Bool', access: 'R', comment: 'Selettore utenza in remoto' },
      { suffix: '.Worktime.Reset', type: 'Bool', access: 'R/W', comment: 'Comando reset ore parziali utenza' },
      { suffix: '.Worktime.Total.Hour', type: 'Dint', access: 'R', comment: 'Ore totali', rawMin: 0, rawMax: 9999999, unit: 'Min', scalaMin: 0, scalaMax: 9999999 },
  { suffix: '.Worktime.Total.Min', type: 'Int', access: 'R', comment: 'Minuti totali', rawMin: 0, rawMax: 59, unit: 'Min', scalaMin: 0, scalaMax: 59 },
      { suffix: '.Worktime.Partial.Hour', type: 'Dint', access: 'R', comment: 'Ore Parziali', rawMin: 0, rawMax: 9999999, unit: 'Min', scalaMin: 0, scalaMax: 9999999 },
  { suffix: '.Worktime.Partial.Min', type: 'Int', access: 'R', comment: 'Minuti Parziali', rawMin: 0, rawMax: 59, unit: 'Min', scalaMin: 0, scalaMax: 59 }
    ],
    'valve_inv': [
      { suffix: '.Command.Atomatic', type: 'Bool', access: 'R/W', comment: 'Comando modalità automatica' },
      { suffix: '.Command.Manual', type: 'Bool', access: 'R/W', comment: 'Comando modalità manuale' },
      { suffix: '.Command.Cmd_Man', type: 'Bool', access: 'R/W', comment: 'Comando start manuale' },
      { suffix: '.Command.Cmd_Man_Open', type: 'Bool', access: 'R/W', comment: 'Comando manuale Apertura' },
      { suffix: '.Status.Ready', type: 'Bool', access: 'R', comment: 'Utenza pronta' },
      { suffix: '.Status.Opening', type: 'Bool', access: 'R', comment: 'Utenza in apertura' },
      { suffix: '.Status.Closing', type: 'Bool', access: 'R', comment: 'Utenza in chiusura' },
      { suffix: '.Status.Automatic', type: 'Bool', access: 'R', comment: 'Utenza in modalità automatica' },
      { suffix: '.Status.Manual', type: 'Bool', access: 'R', comment: 'Utenza in modalità manuale' },
      { suffix: '.Status.Selector', type: 'Bool', access: 'R', comment: 'Selettore utenza in remoto' },
      { suffix: '.Worktime.Reset', type: 'Bool', access: 'R/W', comment: 'Comando reset ore parziali utenza' },
      { suffix: '.Worktime.Total.Hour', type: 'Dint', access: 'R', comment: 'Ore totali', rawMin: 0, rawMax: 9999999, unit: 'Min', scalaMin: 0, scalaMax: 9999999 }
    ],
    'valve_noinv': [
      { suffix: '.Command.Atomatic', type: 'Bool', access: 'R/W', comment: 'Comando modalità automatica' },
      { suffix: '.Command.Manual', type: 'Bool', access: 'R/W', comment: 'Comando modalità manuale' },
      { suffix: '.Command.Cmd_Man', type: 'Bool', access: 'R/W', comment: 'Comando start manuale' },
      { suffix: '.Status.Ready', type: 'Bool', access: 'R', comment: 'Utenza pronta' },
      { suffix: '.Status.Running', type: 'Bool', access: 'R', comment: 'Utenza in marcia' },
      { suffix: '.Status.Automatic', type: 'Bool', access: 'R', comment: 'Utenza in modalità automatica' },
      { suffix: '.Status.Manual', type: 'Bool', access: 'R', comment: 'Utenza in modalità manuale' },
      { suffix: '.Status.Selector', type: 'Bool', access: 'R', comment: 'Selettore utenza in remoto' },
      { suffix: '.Worktime.Reset', type: 'Bool', access: 'R/W', comment: 'Comando reset ore parziali utenza' },
      { suffix: '.Worktime.Total.Hour', type: 'Dint', access: 'R', comment: 'Ore totali', rawMin: 0, rawMax: 9999999, unit: 'Min', scalaMin: 0, scalaMax: 9999999 },
  { suffix: '.Worktime.Total.Min', type: 'Int', access: 'R', comment: 'Minuti totali', rawMin: 0, rawMax: 59, unit: 'Min', scalaMin: 0, scalaMax: 59 },
      { suffix: '.Worktime.Partial.Hour', type: 'Dint', access: 'R', comment: 'Ore Parziali', rawMin: 0, rawMax: 9999999, unit: 'Min', scalaMin: 0, scalaMax: 9999999 },
  { suffix: '.Worktime.Partial.Min', type: 'Int', access: 'R', comment: 'Minuti Parziali', rawMin: 0, rawMax: 59, unit: 'Min', scalaMin: 0, scalaMax: 59 }
    ]
  };

  // Restituisce l'indirizzo calcolato sommando l'offset dalla sequenza al baseRaw.
  const addressFromSequence = (baseRaw, seqKey, idx) => {
    const seq = ADDRESS_SEQUENCES[seqKey];
    if (!seq || idx < 0 || idx >= seq.length) return null;

    const base = parseAddr(baseRaw);
    const offset = parseAddr(seq[idx]);

    let word = base.word + offset.word;
    let bit = base.bit + offset.bit;

    // Gestione overflow dei bit
    if (bit >= 16) {
      const carry = Math.floor(bit / 16);
      word += carry;
      bit = bit % 16;
    }

    // Gestione bit negativi con prestito
    if (bit < 0) {
      const borrow = Math.ceil(Math.abs(bit) / 16);
      word -= borrow;
      bit = ((bit % 16) + 16) % 16;
    }

    const result = `${word},${bit}`;
    console.log('[addressFromSequence]', { 
      seqKey, 
      idx, 
      seqValue: seq[idx], 
      baseRaw, 
      baseParsed: base,
      offsetParsed: offset,
      resultWord: word,
      resultBit: bit,
      result 
    });
    return result;
  };
  
  // Build full structure for an array of parsed devices
  const buildStructureFromDevices = (devices, compType, invFlag) => {
    const seqKey = `${compType === 'pump' ? 'pump' : 'valve'}_${invFlag ? 'inv' : 'noinv'}`;
    const tmpl = STRUCTURE_TEMPLATES[seqKey] || [];
    const seq = ADDRESS_SEQUENCES[seqKey] || [];
    const result = [];

    devices.forEach(dev => {
      const baseRaw = dev.indirizzo;
      tmpl.forEach((fieldTemplate, idx) => {
        // If sequence has an entry at this index use it, otherwise fallback to computeAddress with 0 offset
        let addr = null;
        if (idx < seq.length) {
          addr = addressFromSequence(baseRaw, seqKey, idx);
        }
        if (!addr) {
          // fallback: use computeAddress with 0 offset (keeps previous behavior safe)
          addr = computeAddress(baseRaw, 0);
        }

        const item = {
          name: `${dev.nome}${fieldTemplate.suffix}`,
          type: fieldTemplate.type,
          address: addr,
          access: fieldTemplate.access,
          comment: fieldTemplate.comment || '',
          stato: ''
        };

        if (fieldTemplate.rawMin !== undefined) {
          item.rawMin = fieldTemplate.rawMin;
          item.rawMax = fieldTemplate.rawMax;
          item.unit = fieldTemplate.unit;
          item.scalaMin = fieldTemplate.scalaMin;
          item.scalaMax = fieldTemplate.scalaMax;
        }

        result.push(item);
      });
    });

    return result;
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === 'admin' && password === 'jonni') {
      setLoggedIn(true);
    } else {
      alert('Credenziali non valide. Riprova.');
    }
  };

  const generateStructure = () => {
    if (!tableData) {
      console.error('tableData è vuoto o non definito:', tableData);
      return [];
    }

    const sections = tableData.split('---').filter(section => section.trim());
    if (sections.length === 0) {
      console.error('Nessuna sezione valida trovata in tableData:', tableData);
      return [];
    }

    const devices = sections.map((section, index) => {
      const lines = section.split('\n').filter(line => line.trim());
      const dev = { id: index + 1, nome: '', indirizzo: '' };
      lines.forEach(line => {
        if (line.includes('Nome:')) dev.nome = line.split('Nome:')[1].trim();
        if (line.includes('Indirizzo:')) dev.indirizzo = line.split('Indirizzo:')[1].trim();
      });
      return dev;
    }).filter(d => d.nome && d.indirizzo);

    const built = buildStructureFromDevices(devices, componentType, hasInverter);
    console.log('Struttura generata (centralizzata):', built);
    return built;
  };

  const handleGenerate = () => {
    if (!tableData) {
      alert('Nessun dato disponibile per generare la struttura. Importa un file prima di procedere.');
      return;
    }

    const generatedStructure = generateStructure();
    setStructure(generatedStructure);
    console.log('Struttura generata dal pulsante:', generatedStructure);
  };

  const handleExport = () => {
    try {
      if (!structure || structure.length === 0) {
        alert('Nessuna struttura da esportare. Genera una struttura prima di procedere.');
        return;
      }
      console.log('Avvio export', { templateHeader, templateRows, structureLength: structure.length });
      // Raggruppa gli elementi per pompa
      const pompeMap = {};
      const pumpNamesOrdered = [];
      structure.forEach(item => {
        const pompeName = (item.name && item.name.split ? item.name.split('.')[0] : String(item.name || ''));
        if (!pompeMap[pompeName]) {
          pompeMap[pompeName] = [];
          pumpNamesOrdered.push(pompeName);
        }
        pompeMap[pompeName].push(item);
      });

      // Tutte le colonne che vuoi presenti nel file, anche se vuote
      const defaultHeaders = [
        'Tag Name', 'Data type', 'Address PLC', 'ACCESSO', 'Comment',
        'Stato', 'RaW min', 'RaW maX', 'Unità di misura', 'Scala min', 'Scala maX', 'Modifiche'
      ];

      const headers = templateHeader && templateHeader.length ? templateHeader : defaultHeaders;
      const aoa = [];
      const merges = [];
      // pumpNames visible to whole function (preserve order from structure)
      let pumpNames = pumpNamesOrdered.length ? pumpNamesOrdered : Object.keys(pompeMap);

      // Se abbiamo un template caricato, usalo come base; altrimenti usa il comportamento semplice
      if (templateRows && templateRows.length && templateHeader && templateHeader.length) {
        // header (una volta sola)
        aoa.push(headers.map(h => (h === undefined ? '' : String(h))));
        // separazione: una riga vuota tra header e prima struttura
        aoa.push(new Array(headers.length).fill(''));

        // trova indice della colonna address e tag name nella template
        const _addrIdx = templateHeader.findIndex(h => /address/i.test(String(h)));
        const addrIndex = _addrIdx >= 0 ? _addrIdx : 2;
        const _tagIdx = templateHeader.findIndex(h => /tag name/i.test(String(h)));
        const tagIndex = _tagIdx >= 0 ? _tagIdx : 0;

        // calcola base del template (prima riga con numero nella colonna address)
        let templateBase = null;
        const numericFrom = (s) => {
          if (!s) return null;
          const m = String(s).match(/(\d+[,.]?\d*)/);
          if (!m) return null;
          return parseFloat(m[1].replace(',', '.'));
        };

        for (let i = 0; i < templateRows.length; i++) {
          const n = numericFrom(templateRows[i][addrIndex]);
          if (n !== null) { templateBase = n; break; }
        }

        // calcola offset per ogni template row (null se non numerico)
        const offsets = templateRows.map(r => {
          const n = numericFrom(r[addrIndex]);
          return n !== null && templateBase !== null ? (n - templateBase) : null;
        });

  // pumpNames already defined above
  pumpNames.forEach((pompeName, pIdx) => {
          // Usa gli elementi della struttura per questa pompa
          const pumpItems = pompeMap[pompeName];

          // per ogni riga template, generiamo la riga sostituendo tag e address
          templateRows.forEach((trow, idx) => {
            // costruisci una riga di lunghezza headers.length
            const row = new Array(headers.length).fill('');

            // Prendi l'elemento corrispondente dalla struttura (se esiste)
            const structItem = pumpItems[idx] || null;

            // Tag Name: usa il nome dalla struttura se disponibile, altrimenti calcola dal template
            if (structItem) {
              row[0] = structItem.name || '';
            } else {
              const tTag = trow[tagIndex] || '';
              let newTag = tTag;
              if (tTag.indexOf('.') !== -1) {
                const suffix = tTag.substring(tTag.indexOf('.'));
                newTag = `${pompeName}${suffix}`;
              } else if (tTag.includes('{PUMP}')) {
                newTag = tTag.replace(/\{PUMP\}/g, pompeName);
              } else {
                newTag = `${pompeName}_${tTag}`;
              }
              row[0] = newTag;
            }

            // Data type / Comment / ACCESSO: prendi dai template se presenti
            const _dataTypeIdx = templateHeader.findIndex(h => /data type/i.test(String(h)));
            const dataTypeIdx = _dataTypeIdx >= 0 ? _dataTypeIdx : 1;
            const _accessIdx = templateHeader.findIndex(h => /access/i.test(String(h)));
            const accessIdx = _accessIdx >= 0 ? _accessIdx : 3;
            const _commentIdx = templateHeader.findIndex(h => /comment/i.test(String(h)));
            const commentIdx = _commentIdx >= 0 ? _commentIdx : 4;

            row[1] = structItem ? (structItem.type || '') : (trow[dataTypeIdx] || '');

            // Address PLC: USA L'INDIRIZZO DALLA STRUTTURA (già calcolato con addressFromSequence)
            row[2] = structItem ? (structItem.address || '') : (trow[addrIndex] || '');

            row[3] = structItem ? (structItem.access || '') : (trow[accessIdx] || '');
            row[4] = structItem ? (structItem.comment || '') : (trow[commentIdx] || '');

            // campi opzionali (Stato, RaW min, RaW maX, Unità, Scala min, Scala maX)
            // USA I VALORI DALLA STRUTTURA se disponibili, altrimenti dal template
            const statoIdx = templateHeader.findIndex(h => /stato/i.test(String(h)));
            const rawMinIdx = templateHeader.findIndex(h => /raW min/i.test(String(h)) || /raw min/i.test(String(h)));
            const rawMaxIdx = templateHeader.findIndex(h => /raW maX/i.test(String(h)) || /raw ma/i.test(String(h)));
            const unitIdx = templateHeader.findIndex(h => /unit/i.test(String(h)));
            const scalaMinIdx = templateHeader.findIndex(h => /scala min/i.test(String(h)));
            const scalaMaxIdx = templateHeader.findIndex(h => /scala ma/i.test(String(h)));

            row[5] = structItem ? (structItem.stato || '') : ((statoIdx >= 0 ? trow[statoIdx] : '') || '');
            row[6] = structItem && structItem.rawMin !== undefined ? structItem.rawMin : ((rawMinIdx >= 0 ? trow[rawMinIdx] : '') || '');
            row[7] = structItem && structItem.rawMax !== undefined ? structItem.rawMax : ((rawMaxIdx >= 0 ? trow[rawMaxIdx] : '') || '');
            row[8] = structItem ? (structItem.unit || '') : ((unitIdx >= 0 ? trow[unitIdx] : '') || '');
            row[9] = structItem && structItem.scalaMin !== undefined ? structItem.scalaMin : ((scalaMinIdx >= 0 ? trow[scalaMinIdx] : '') || '');
            row[10] = structItem && structItem.scalaMax !== undefined ? structItem.scalaMax : ((scalaMaxIdx >= 0 ? trow[scalaMaxIdx] : '') || '');

            aoa.push(row);
          });
          // separazione di almeno 3 righe vuote tra pompe (tranne dopo l'ultima)
          if (pIdx < pumpNames.length - 1) {
            aoa.push(new Array(headers.length).fill(''));
            aoa.push(new Array(headers.length).fill(''));
            aoa.push(new Array(headers.length).fill(''));
          }
        });
      } else {
        // fallback: comportamento precedente semplice
        const headers = defaultHeaders;
        aoa.push(headers);
        // separazione: una riga vuota tra header e prima struttura
        aoa.push(new Array(headers.length).fill(''));
        // ensure pumpNames in fallback uses object keys order
        pumpNames = Object.keys(pompeMap);
        // Output structure rows directly (no pump title rows)
        pumpNames.forEach((pompeName, pIdx) => {
          pompeMap[pompeName].forEach(item => {
            aoa.push([
              item.name || '',
              item.type || '',
              item.address || '',
              item.access || '',
              item.comment || '',
              item.stato || '',
              item.rawMin !== undefined ? item.rawMin : '',
              item.rawMax !== undefined ? item.rawMax : '',
              item.unit || '',
              item.scalaMin !== undefined ? item.scalaMin : '',
              item.scalaMax !== undefined ? item.scalaMax : '',
              ''
            ]);
          });
          // separazione di almeno 3 righe vuote tra pompe (tranne dopo l'ultima)
          if (pIdx < pumpNames.length - 1) {
            aoa.push(new Array(headers.length).fill(''));
            aoa.push(new Array(headers.length).fill(''));
            aoa.push(new Array(headers.length).fill(''));
          }
        });
      }

      const worksheet = XLSX.utils.aoa_to_sheet(aoa);
      worksheet['!merges'] = merges;

      // Stili
      const headerStyle = {
        fill: { fgColor: { rgb: 'FFFFFFFF' } }, // Sfondo bianco
        alignment: { horizontal: 'center', vertical: 'center' },
        font: { bold: true, color: { rgb: 'FFFF0000' } } // Testo rosso
      };

      const titleStyle = {
        fill: { fgColor: { rgb: 'FFFFC000' } }, // Giallo/arancione
        alignment: { horizontal: 'center', vertical: 'center' },
        font: { bold: true, color: { rgb: 'FF000000' } }
      };

      // Applica stile all'intestazione in cima (prima riga)
      for (let c = 0; c < headers.length; c++) {
        const cell = XLSX.utils.encode_cell({ c, r: 0 });
        if (worksheet[cell]) worksheet[cell].s = headerStyle;
      }

      // No pump title rows to style (we output structure rows directly)

      // Imposta le larghezze delle colonne dinamicamente in base al numero di headers
      const cols = headers.map((h, i) => {
        if (i === 0 || i === 4 || i === headers.length - 1) return { wch: 40 };
        if (i === 2) return { wch: 20 };
        if (i === 1) return { wch: 18 };
        return { wch: 12 };
      });
      worksheet['!cols'] = cols;

      console.log('Export AOArows:', aoa.length, 'pumpNames:', pumpNames);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Struttura');

      // Usa il valore presente nell'input sotto il pulsante per il filename (nessun popup)
      try {
        const defaultName = 'Struttura';
        let nameBase = (exportFilename && String(exportFilename).trim()) ? String(exportFilename).trim() : defaultName;
        if (nameBase.toLowerCase().endsWith('.xlsx')) {
          nameBase = nameBase.slice(0, -5);
        }
        const filename = nameBase + '.xlsx';
        XLSX.writeFile(workbook, filename);
      } catch (errWrite) {
        console.error('Errore durante writeFile:', errWrite);
        XLSX.writeFile(workbook, 'Struttura.xlsx');
      }
      alert('Struttura esportata con successo!');
    } catch (err) {
      console.error('Errore durante esportazione:', err);
      alert('Errore durante l\'esportazione. Controlla la console per dettagli.');
    }
  };

  // Funzione helper per rendere le icone
  const renderIcon = (name) => {
    return <i className={`lucide lucide-${name}`}></i>;
  };

  // Aggiungo ulteriori log per il debug nella funzione buildGeneratedFromPumps
  const buildGeneratedFromPumps = (pumps) => {
    if (!pumps || !pumps.length) return { flat: [], aoa: [] };

    const headers = templateHeader && templateHeader.length ? templateHeader : [
      'Tag Name', 'Data type', 'Address PLC', 'ACCESSO', 'Comment', 'Stato', 'RaW min', 'RaW maX', 'Unità di misura', 'Scala min', 'Scala maX', 'Modifiche'
    ];
    const headerMap = templateHeaderMap || computeHeaderMap(headers);
    const tagIndex = headerMap.tagIndex >= 0 ? headerMap.tagIndex : 0;
    const addrIndex = headerMap.addrIndex >= 0 ? headerMap.addrIndex : 2;
    const dataTypeIdx = headerMap.dataTypeIdx >= 0 ? headerMap.dataTypeIdx : 1;
    const accessIdx = headerMap.accessIdx >= 0 ? headerMap.accessIdx : 3;
    const commentIdx = headerMap.commentIdx >= 0 ? headerMap.commentIdx : 4;

    const flat = [];
    const aoa = [];

    const seqKey = `${componentType === 'pump' ? 'pump' : 'valve'}_${hasInverter ? 'inv' : 'noinv'}`;
    const tmpl = STRUCTURE_TEMPLATES[seqKey] || [];
    const rowsPerPump = tmpl.length;

    pumps.forEach((p, pIdx) => {
      const pumpName = (p.nome || p.name || '').toString();
      const baseRaw = p.indirizzo || p.address || '';

      console.log(`[DEBUG] Generazione per pompa: ${pumpName}, indirizzo base: ${baseRaw}`);

      for (let i = 0; i < rowsPerPump; i++) {
        const tmeta = tmpl[i] || {};
        const tagName = `${pumpName}${tmeta.suffix || `_r${i}`}`;
        const addr = addressFromSequence(baseRaw, seqKey, i) || computeAddress(baseRaw, i, 0);

        console.log(`[DEBUG] Tag: ${tagName}, Indirizzo calcolato: ${addr}`);

        const flatItem = {
          name: tagName,
          type: tmeta.type || '',
          address: addr,
          access: tmeta.access || '',
          comment: tmeta.comment || '',
          stato: '',
        };

        if (tmeta.rawMin !== undefined) {
          flatItem.rawMin = tmeta.rawMin;
          flatItem.rawMax = tmeta.rawMax;
          flatItem.unit = tmeta.unit;
          flatItem.scalaMin = tmeta.scalaMin;
          flatItem.scalaMax = tmeta.scalaMax;
        }

        flat.push(flatItem);

        const row = new Array(headers.length).fill('');
        row[tagIndex] = flatItem.name || '';
        row[dataTypeIdx] = flatItem.type || '';
        row[addrIndex] = flatItem.address || '';
        row[accessIdx] = flatItem.access || '';
        row[commentIdx] = flatItem.comment || '';

        aoa.push(row);
      }

      if (pIdx < pumps.length - 1) {
        aoa.push(new Array(headers.length).fill(''));
        aoa.push(new Array(headers.length).fill(''));
        aoa.push(new Array(headers.length).fill(''));
      }
    });

    return { flat, aoa };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {!loggedIn ? (
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4">Login</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <input 
                value={username} 
                onChange={(e)=>setUsername(e.target.value)} 
                placeholder="Username (admin)" 
                className="w-full p-3 border rounded" 
              />
              <input 
                type="password" 
                value={password} 
                onChange={(e)=>setPassword(e.target.value)} 
                placeholder="Password" 
                className="w-full p-3 border rounded" 
              />
              <div className="flex justify-end gap-2">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  Accedi
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">Generatore Struttura</h1>
              <button onClick={() => setLoggedIn(false)} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                Logout
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Configurazione</h2>
                <div>
                  <label className="block text-sm font-medium mb-1">Tipologia</label>
                  <select 
                    value={componentType} 
                    onChange={(e) => setComponentType(e.target.value)} 
                    className="w-full p-2 border rounded"
                  >
                    <option value="pump">Pompa</option>
                    <option value="valve">Valvola</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium">Importa Dati Componenti</label>
                  <div className="flex gap-2">
                      <input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={(e) => {
                        const file = e.target.files[0];
                        if (!file) {
                          console.error('[IMPORT] Nessun file selezionato.');
                          return;
                        }

                        console.log('[IMPORT] File selezionato:', file.name, 'Tipo:', file.type, 'Dimensione:', file.size);

                        const reader = new FileReader();
                        
                        reader.onerror = (error) => {
                          console.error('[IMPORT] Errore durante la lettura del file:', error);
                          alert('Errore durante la lettura del file.');
                        };

                        reader.onload = (evt) => {
                          try {
                            console.log('[IMPORT] File caricato, elaborazione in corso...');
                            let data;
                            if (file.name.endsWith('.csv')) {
                              // Gestione file CSV
                              const text = evt.target.result;
                              console.log('[IMPORT] Contenuto CSV:', text.substring(0, 200));
                              const rows = text.split(/\r\n|\n/)
                                             .filter(row => row.trim().length > 0);
                              data = rows.map(row => row.split(/[,;\t]/));
                              console.log('[IMPORT] Righe CSV parsate:', data.length);
                            } else {
                              // Gestione file Excel (.xlsx, .xls)
                              console.log('[IMPORT] Lettura file Excel...');
                              const workbook = XLSX.read(evt.target.result, { type: 'array' });
                              console.log('[IMPORT] Fogli disponibili:', workbook.SheetNames);
                              const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                              
                              // Converti il foglio Excel in array di righe
                              const excelRows = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
                              console.log('[IMPORT] Righe Excel totali:', excelRows.length);
                              console.log('[IMPORT] Prima riga (header):', excelRows[0]);
                              console.log('[IMPORT] Seconda riga (esempio):', excelRows[1]);
                              
                              // NON rimuovere l'intestazione: leggi dalla prima riga in poi
                              data = excelRows
                                .filter(row => row && row.length > 0 && row.some(cell => cell !== undefined && String(cell).trim() !== ''));
                              console.log('[IMPORT] Righe filtrate:', data.length);
                            }
                            
                            if (!data || data.length === 0) {
                              console.error('[IMPORT] Nessun dato valido trovato nel file importato.');
                              alert('Il file importato non contiene dati validi.');
                              return;
                            }

                            // Genera la struttura per ciascuna pompa utilizzando solo il nome e l'indirizzo iniziale
                            const numericFrom = (s) => {
                              if (!s) return null;
                              const m = String(s).match(/(\d+[,.]?\d*)/);
                              if (!m) return null;
                              return parseFloat(m[1].replace(',', '.'));
                            };

                            const rawStructures = data.map((row, index) => {
                              const nome = (row[0] || '').toString().trim();
                              const indirizzo = row[2] !== undefined ? row[2].toString().trim() : '';
                              console.log(`[IMPORT] Riga ${index}: Nome='${nome}', Indirizzo='${indirizzo}'`);
                              return {
                                id: index + 1,
                                nome: nome,
                                indirizzo: indirizzo,
                                hasValidAddress: numericFrom(indirizzo) !== null
                              };
                            });

                            console.log('[IMPORT] Strutture grezze lette dal file:', rawStructures);

                            // Filtra righe non valide: nome non vuoto E indirizzo numerico valido
                            const structures = rawStructures.filter(s => {
                              return s.nome && s.nome.length > 0 && s.hasValidAddress;
                            });

                            console.log('[IMPORT] Strutture filtrate (valide):', structures);

                            if (structures.length === 0) {
                              console.warn('[IMPORT] Nessuna struttura valida trovata. Verifica il formato del file.');
                              alert('Nessuna struttura valida trovata nel file. Assicurati che il file contenga:\n- Colonna 1: Nome pompa/valvola\n- Colonna 3: Indirizzo iniziale (formato numerico, es. 100 o 100,0)');
                              return;
                            }

                            // Converti la struttura in formato leggibile per l'anteprima
                            const formattedData = structures.map(structure => {
                              return `ID: ${structure.id}\nNome: ${structure.nome}\nIndirizzo: ${structure.indirizzo}\n`;
                            }).join('\n---\n');

                            console.log('[IMPORT] Dati formattati:', formattedData);

                            // Imposta i dati nella textarea
                            setTableData(formattedData);

                            // Non generiamo automaticamente la struttura all'import.
                            // L'utente deve cliccare il pulsante "Genera Struttura" per creare la struttura.
                            setStructure([]);
                            console.log('[IMPORT] Importazione completata con successo! Clicca "Genera Struttura" per creare la struttura.');
                            alert(`Importate ${structures.length} pompe/valvole con successo! Clicca "Genera Struttura" per procedere.`);
                          } catch (error) {
                            console.error('[IMPORT] Errore durante la lettura del file:', error);
                            console.error('[IMPORT] Stack trace:', error.stack);
                            alert('Errore durante la lettura del file: ' + error.message);
                          }
                        };

                        if (file.name.endsWith('.csv')) {
                          reader.readAsText(file);
                        } else {
                          reader.readAsArrayBuffer(file);
                        }
                      }}
                      className="hidden"
                      id="excelFile"
                    />
                    <label
                      htmlFor="excelFile"
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2 cursor-pointer justify-center w-full"
                    >
                      {renderIcon('upload')}
                      Importa Excel
                    </label>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-2">Oppure Incolla Tabella</label>
                    <textarea
                      className="w-full p-2 border rounded h-32 font-mono text-sm"
                      placeholder="Incolla qui i dati della tabella..."
                      value={tableData}
                      onChange={(e) => setTableData(e.target.value)}
                    ></textarea>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Configurazione Inverter</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="hasInverter" 
                      checked={hasInverter} 
                      onChange={(e) => setHasInverter(e.target.checked)} 
                      className="w-4 h-4" 
                    />
                    <label htmlFor="hasInverter">Dotato di Inverter</label>
                  </div>
                </div>

                <button 
                  onClick={handleGenerate} 
                  className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 flex items-center gap-2 w-full justify-center"
                >
                  {renderIcon('play')}
                  Genera Struttura
                </button>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Anteprima Struttura</h2>
                <div className="bg-gray-100 p-4 rounded-lg h-[400px] overflow-y-auto font-mono text-sm">
                  <pre>
                    {tableData ? `Struttura generata con ${structure.length} elementi:\n${structure.map(item => `${item.name} (${item.type})`).join('\n')}` : 'Importa o incolla i dati per vedere l\'anteprima...'}
                  </pre>
                </div>
                <div className="mt-2">
                  <label className="block text-sm text-gray-600 mb-1">Nome file export</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={exportFilename}
                      onChange={(e) => {
                        let v = String(e.target.value || '');
                        v = v.replace(/\.xlsx$/i, '').trim();
                        setExportFilename(v);
                        setExportFilenameEdited(true);
                      }}
                      placeholder={'Struttura'}
                      className="flex-1 p-2 border rounded text-sm bg-transparent placeholder-gray-400"
                    />
                    <span className="text-sm text-gray-600">.xlsx</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">L'estensione <strong>.xlsx</strong> è fissata e verrà aggiunta automaticamente. Modifica solo il nome base.</p>
                </div>
                <div className="flex gap-2 mt-3">
                  <button 
                    onClick={handleExport}
                    className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 flex items-center gap-2 w-full justify-center"
                  >
                    {renderIcon('file-text')}
                    Esporta Excel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

try {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(<PumpStructureGenerator />);
} catch (renderErr) {
  console.error('Errore durante il render dell\'app:', renderErr);
  try { alert('Errore durante il render dell\'app: ' + (renderErr && renderErr.message ? renderErr.message : String(renderErr))); } catch (e) {}
}
