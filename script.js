window.onload = function(){

const rows=15, cols=20;
const grid=document.getElementById("grid");

if(!grid){
 alert("Grid not found!");
 return;
}

let cells=[], start=[0,0], end=[14,19];
let wallMode=false;
let mouseDown=false;

// Create grid
for(let r=0;r<rows;r++){
 cells[r]=[];
 for(let c=0;c<cols;c++){
  let d=document.createElement("div");
  d.className="cell";

  grid.appendChild(d);
  cells[r][c]=d;

  // Wall drawing
  d.addEventListener("mousedown",()=>{
   if(wallMode) d.classList.toggle("wall");
  });

  d.addEventListener("mouseover",()=>{
   if(wallMode && mouseDown) d.classList.add("wall");
  });
 }
}

document.body.onmousedown=()=>mouseDown=true;
document.body.onmouseup=()=>mouseDown=false;

cells[start[0]][start[1]].classList.add("start");
cells[end[0]][end[1]].classList.add("end");

function sleep(ms){return new Promise(r=>setTimeout(r,ms));}
window.reset=()=>location.reload();

window.toggleWall=()=>{
 wallMode=!wallMode;
};

window.start=async(type)=>{
 clear();
 let parent=Array(rows).fill().map(()=>Array(cols).fill(null));
 if(type==="bfs") await bfs(parent);
 if(type==="dfs") await dfs(parent);
 if(type==="dijkstra") await bfs(parent);
 if(type==="astar") await bfs(parent);
 drawPath(parent);
};

function clear(){
 for(let r=0;r<rows;r++)
  for(let c=0;c<cols;c++)
   cells[r][c].classList.remove("visited","path");
}

const dirs=[[1,0],[-1,0],[0,1],[0,-1]];

function valid(r,c,vis){
 if(r<0||c<0||r>=rows||c>=cols) return false;
 if(cells[r][c].classList.contains("wall")) return false;
 if(vis&&vis[r][c]) return false;
 return true;
}

function mark(r,c){
 if(!cells[r][c].classList.contains("start")&&!cells[r][c].classList.contains("end"))
  cells[r][c].classList.add("visited");
}

// BFS
async function bfs(parent){
 let q=[[0,0]];
 let vis=Array(rows).fill().map(()=>Array(cols).fill(false));
 vis[0][0]=true;

 while(q.length){
  let [r,c]=q.shift();
  for(let[d1,d2] of dirs){
   let nr=r+d1,nc=c+d2;
   if(valid(nr,nc,vis)){
    vis[nr][nc]=true;
    parent[nr][nc]=[r,c];
    q.push([nr,nc]);
    mark(nr,nc);
    await sleep(20);
   }
  }
 }
}

// DFS
async function dfs(parent){
 let st=[[0,0]];
 let vis=Array(rows).fill().map(()=>Array(cols).fill(false));

 while(st.length){
  let[r,c]=st.pop();
  if(vis[r][c]) continue;
  vis[r][c]=true;
  for(let[d1,d2] of dirs){
   let nr=r+d1,nc=c+d2;
   if(valid(nr,nc,vis)){
    parent[nr][nc]=[r,c];
    st.push([nr,nc]);
   }
  }
  mark(r,c);
  await sleep(20);
 }
}

// Path draw
async function drawPath(parent){
 let cur=[14,19];
 while(cur){
  let[r,c]=cur;
  cells[r][c].classList.add("path");
  cur=parent[r][c];
  await sleep(30);
 }
}

};
