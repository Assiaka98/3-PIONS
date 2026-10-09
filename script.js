let board=Array(9).fill(null), turn=1, phase='pose', placed={1:0,2:0}, selected=null, gameOver=false;
let vsIA=false; // false = 2 joueurs par défaut comme sur ta capture
const boardEl=document.getElementById('board'), statusEl=document.getElementById('status'), phaseEl=document.getElementById('phaseInfo');
const ADJ={0:[1,3,4],1:[0,2,3,4,5],2:[1,4,5],3:[0,1,4,6,7],4:[0,1,2,3,5,6,7,8],5:[1,2,4,7,8],6:[3,4,7],7:[3,4,5,6,8],8:[4,5,7]};
const WINS=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

function init(){boardEl.innerHTML=''; for(let i=0;i<9;i++){let c=document.createElement('div');c.className='cell';c.onclick=()=>play(i);boardEl.appendChild(c);} render();}
function getWin(b){for(let w of WINS) if(b[w[0]]&&b[w[0]]==b[w[1]]&&b[w[1]]==b[w[2]]) return w; return null;}
function checkWin(b){let w=getWin(b); return w?b[w[0]]:null;}

function play(i){
  if(gameOver) return;
  if(vsIA && turn===2) return; // bloque clic pendant tour ordi

  if(phase==='pose'){
    if(board[i]) return; board[i]=turn; placed[turn]++;
    if(placed[1]===3 && placed[2]===3) phase='deplace';
  }else{
    if(selected===null){ if(board[i]!==turn) return; selected=i; render(); return;}
    else{ if(board[i] ||!ADJ[selected].includes(i)){selected=null; render(); return;} board[i]=turn; board[selected]=null; selected=null;}
  }

  let winner=checkWin(board);
  if(winner){
    if(vsIA) statusEl.textContent = winner===1? '🏆 Tu gagnes!' : '💻 Ordi gagne!';
    else statusEl.textContent = `🏆 VICTOIRE J${winner}!`;
    gameOver=true; render(); return;
  }

  if(selected===null) turn=turn===1?2:1;
  updateStatus(); render();

  if(vsIA && turn===2 &&!gameOver) setTimeout(iaPlay, 600);
}

function iaPlay(){
  if(phase==='pose'){ let m=findBestPose(); board[m]=2; placed[2]++; if(placed[1]===3&&placed[2]===3) phase='deplace';}
  else{ let m=findBestDeplace(); if(m){board[m.to]=2; board[m.from]=null;} }
  if(checkWin(board)){statusEl.textContent='💻 Ordi gagne!'; gameOver=true; render(); return;}
  turn=1; updateStatus(); render();
}
function findBestPose(){
  for(let i=0;i<9;i++) if(!board[i]){board[i]=2; if(checkWin(board)===2){board[i]=null; return i;} board[i]=null;}
  for(let i=0;i<9;i++) if(!board[i]){board[i]=1; if(checkWin(board)===1){board[i]=null; return i;} board[i]=null;}
  if(!board[4]) return 4;
  let c=[0,2,6,8].filter(i=>!board[i]); if(c.length) return c[Math.floor(Math.random()*c.length)];
  let e=board.map((v,i)=>v?null:i).filter(v=>v!==null); return e[Math.floor(Math.random()*e.length)];
}
function findBestDeplace(){
  let my=board.map((v,i)=>v===2?i:null).filter(v=>v!==null);
  for(let from of my) for(let to of ADJ[from]) if(!board[to]){board[to]=2; board[from]=null; if(checkWin(board)===2){board[from]=2; board[to]=null; return {from,to};} board[from]=2; board[to]=null;}
  for(let to=0;to<9;to++) if(!board[to]){board[to]=1; if(checkWin(board)===1){board[to]=null; for(let from of my) if(ADJ[from].includes(to)) return {from,to};} board[to]=null;}
  let moves=[]; for(let from of my) for(let to of ADJ[from]) if(!board[to]) moves.push({from,to}); return moves[Math.floor(Math.random()*moves.length)];
}

function render(){
  document.querySelectorAll('.cell').forEach((cell,i)=>{
    cell.textContent=board[i]==1?'🪨':board[i]==2?'🔴':'';
    cell.classList.toggle('selected', selected===i); cell.classList.remove('win');
  });
  let w=getWin(board); if(w) w.forEach(i=>document.querySelectorAll('.cell')[i].classList.add('win'));
}
function updateStatus(){
  let name = turn===1? (vsIA? 'TOI 🪨' : 'JOUEUR 1 🪨') : (vsIA? 'IA 🔴' : 'JOUEUR 2 🔴');
  if(phase==='pose') statusEl.textContent=`${name} - Pose (${placed[turn]+1}/3)`;
  else statusEl.textContent= selected!==null? `${name} - Choisis case vide` : `${name} - Choisis ton pion à bouger`;
    phaseEl.textContent=`Phase: ${phase.toUpperCase()} | ${vsIA? 'VS IA' : '2 JOUEURS'}`;
}
function setMode(ia){
  vsIA=ia;
  document.getElementById('label-j2').textContent = ia? '🔴 IA: Capsules' : '🔴 J2: Capsules (3)';
  document.getElementById('btn-ia').classList.toggle('active', ia);
  document.getElementById('label-j1').textContent = ia? '🪨 Toi: Cailloux' : '🪨 J1: Cailloux (3)';
  document.getElementById('label-j2').textContent = ia? '🔴 Ordi: Capsules' : '🔴 J2: Capsules (3)';
  resetGame();
}
function resetGame(){board=Array(9).fill(null); turn=1; phase='pose'; placed={1:0,2:0}; selected=null; gameOver=false; updateStatus(); render();}
function setSkin(s,el){document.body.className='skin-'+s; document.querySelectorAll('.controls button').forEach(b=>b.classList.remove('active')); if(el) el.classList.add('active');}
init(); updateStatus();