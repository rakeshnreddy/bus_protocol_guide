const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./content/visuals/axi-signal-ref.json', 'utf8'));

data.signals = data.signals.map(sig => {
  let role = 'control';
  if (sig.name === 'ACLK') role = 'clock';
  else if (sig.name === 'ARESETn') role = 'control';
  else if (sig.name.startsWith('W') && sig.name !== 'WVALID' && sig.name !== 'WREADY' && sig.name !== 'WLAST') role = 'data';
  else if (sig.name.startsWith('R') && sig.name !== 'RVALID' && sig.name !== 'RREADY' && sig.name !== 'RRESP' && sig.name !== 'RLAST') role = 'data';

  let expansion = sig.description.split('.')[0];

  return {
    name: sig.name,
    expansion: expansion,
    role: role,
    description: sig.description,
    direction: sig.direction,
    width: sig.width,
    relatedTermId: sig.name
  };
});

fs.writeFileSync('./content/visuals/axi-signal-ref.json', JSON.stringify(data, null, 2));
