const input = document.getElementById('input');
const analyze = document.getElementById('analyze');
const clear = document.getElementById('clear');
const grid = document.getElementById('grid');
const stats = document.getElementById('stats');
const copyInput = document.getElementById('copyInput');
const showLabels = document.getElementById('showLabels');
const collapseSpaces = document.getElementById('collapseSpaces');

function typeOfChar(ch){
  if (ch === ' ') return 'space';
  
  if (ch >= '0' && ch <= '9') return 'number';

  if ((ch >= 'A' && ch <= 'Z') || (ch >= 'a' && ch <= 'z')) return 'letter';

  return 'symbol';
}

function getCharacterCategory(ch) {
  const type = typeOfChar(ch);
  if (type === 'space') {
    return 'Space';
  } else if (type === 'letter') {
    return ch === ch.toUpperCase() ? 'Uppercase Letter' : 'Lowercase Letter';
  } else if (type === 'number') {
    return 'Number/Digit';
  } else {
    return 'Symbol/Special';
  }
}

function ambiguousLabel(ch){
  const map = {
    '1':'digit one', 'l':'lower L', 'L':'upper L', 'i':'lower i', 'I':'upper I',
    '0':'digit zero', 'O':'upper O', 'o':'lower o'
  };
  return map.hasOwnProperty(ch) ? map[ch] : null;
}

function classForChar(ch){
  const t = typeOfChar(ch);
  if (t === 'space') return 'bg-secondary-subtle text-secondary-emphasis border-secondary';
  if (t === 'number') return 'bg-warning-subtle text-warning-emphasis border-warning';
  if (t === 'letter'){
    const isUpper = ch === ch.toUpperCase();
    return isUpper ? 'bg-primary-subtle text-primary-emphasis border-primary fw-bold' : 'bg-info-subtle text-info-emphasis border-info fst-italic';
  }
  return 'bg-danger-subtle text-danger-emphasis border-danger';
}

function analyzeText(){
  const txt = input.value || '';
  grid.innerHTML = '';
  if (!txt) { stats.textContent = 'No text provided.'; return }
  const arr = Array.from(txt);
  let counts = {letter:0, number:0, symbol:0, space:0, uppercase:0, lowercase:0};
  
  arr.forEach((ch,i)=>{
    if (ch === ' ' && collapseSpaces.checked) return;
    const t = typeOfChar(ch);
    counts[t]++;
    
    if (t === 'letter') {
      if (ch === ch.toUpperCase()) counts.uppercase++;
      else counts.lowercase++;
    }

    const classes = classForChar(ch);
    const isAmbiguous = ambiguousLabel(ch);
    
    const span = document.createElement('div');
    span.className = `d-inline-flex flex-column align-items-center justify-content-center border rounded p-2 ${classes}`;
    span.style.minWidth = '38px';
    span.style.minHeight = '48px';
    span.style.cursor = 'pointer';
    span.style.transition = 'all 0.2s';
    if(isAmbiguous) span.style.boxShadow = '0 0 0 2px rgba(255, 165, 0, 0.3)';
    
    span.dataset.index = i;
    span.dataset.type = t;
    span.dataset.category = getCharacterCategory(ch);
    span.dataset.code = ch.charCodeAt(0);
    span.dataset.char = ch;

    span.addEventListener('mouseenter', ()=>{
      span.style.transform = 'translateY(-4px) scale(1.05)';
      span.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    });
    span.addEventListener('mouseleave', ()=>{
      span.style.transform = '';
      span.style.boxShadow = isAmbiguous ? '0 0 0 2px rgba(255, 165, 0, 0.3)' : '';
    });

    const labelText = ambiguousLabel(ch);
    if (showLabels.checked && labelText){
      const lbl = document.createElement('div');
      lbl.className = 'small mb-1';
      lbl.style.fontSize = '10px';
      lbl.textContent = labelText;
      span.appendChild(lbl);
    } else if (showLabels.checked && t === 'letter'){
      const caseLabel = (ch === ch.toUpperCase()) ? 'upper' : 'lower';
      const lbl2 = document.createElement('div'); 
      lbl2.className='small mb-1';
      lbl2.style.fontSize = '10px';
      lbl2.textContent = caseLabel; 
      span.appendChild(lbl2);
    } else if (showLabels.checked && t === 'number') {
      const lbl3 = document.createElement('div');
      lbl3.className='small mb-1';
      lbl3.style.fontSize = '10px';
      lbl3.textContent = 'digit';
      span.appendChild(lbl3);
    } else if (showLabels.checked && t === 'symbol') {
      const lbl4 = document.createElement('div');
      lbl4.className='small mb-1';
      lbl4.style.fontSize = '10px';
      lbl4.textContent = 'symbol';
      span.appendChild(lbl4);
    } else if (showLabels.checked && t === 'space') {
      const lbl5 = document.createElement('div');
      lbl5.className='small mb-1';
      lbl5.style.fontSize = '10px';
      lbl5.textContent = 'space';
      span.appendChild(lbl5);
    }

    const chNode = document.createElement('div');
    chNode.className = 'fs-5 fw-bold font-monospace';
    chNode.textContent = ch === ' ' ? '␣' : ch;
    span.appendChild(chNode);

    span.title = `Index: ${i} | Type: ${span.dataset.category} | Code: ${ch.charCodeAt(0)}${labelText ? ' | '+labelText : ''}`;

    span.addEventListener('click', ()=>{
      const info = `${span.dataset.char}\tindex:${span.dataset.index}\ttype:${span.dataset.category}\tcode:${span.dataset.code}${labelText? '\tlabel:'+labelText : ''}`;
      navigator.clipboard.writeText(info).then(()=>{
        const originalTransform = span.style.transform;
        span.style.transform = 'scale(1.1)';
        setTimeout(()=>span.style.transform = originalTransform, 160);
      }).catch(()=>{});
    });

    grid.appendChild(span);
  });
  
  stats.innerHTML = `
    <strong>Length:</strong> ${arr.length} &nbsp;|&nbsp; 
    <strong>Letters:</strong> ${counts.letter} 
    <small class="text-muted">(${counts.uppercase} upper, ${counts.lowercase} lower)</small> &nbsp;|&nbsp; 
    <strong>Numbers:</strong> ${counts.number} &nbsp;|&nbsp; 
    <strong>Symbols:</strong> ${counts.symbol} &nbsp;|&nbsp; 
    <strong>Spaces:</strong> ${counts.space}
  `;
}

analyze.addEventListener('click', analyzeText);
clear.addEventListener('click', ()=>{ input.value=''; grid.innerHTML=''; stats.textContent=''; });
copyInput.addEventListener('click', ()=>{ 
  navigator.clipboard.writeText(input.value || '')
    .then(() => {
      const btn = copyInput;
      const origText = btn.textContent;
      btn.textContent = '✓ Copied!';
      btn.classList.add('btn-success');
      btn.classList.remove('btn-outline-secondary');
      setTimeout(() => {
        btn.textContent = origText;
        btn.classList.remove('btn-success');
        btn.classList.add('btn-outline-secondary');
      }, 1500);
    })
    .catch(()=>{}); 
});

input.addEventListener('paste', ()=> setTimeout(analyzeText,50));
input.addEventListener('keydown', (e)=>{ if(e.key === 'Enter' && (e.ctrlKey||e.metaKey)) analyzeText(); });

input.value = 'i1lL O0 oI @#$% test123';
analyzeText();