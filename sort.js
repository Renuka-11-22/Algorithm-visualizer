myCanvas.width=400;
myCanvas.height=300;
const margin=30;
const n=20;
const array=[];
let moves=[];
const cols=[];
const spacing=(myCanvas.width-margin*2)/n;
const ctx=myCanvas.getContext("2d");

const maxColumnHeight=200;

init();

function init(){
    for(let i=0;i<n;i++){
        array[i]=Math.random();
    }
    moves=[];
    for(let i=0;i<array.length;i++){
        const x=i*spacing+spacing/2+margin;
        const y=myCanvas.height-margin;
        const width=spacing-4;
        const height=maxColumnHeight*array[i];
        cols[i]=new Column(x,y,width,height);
    }
}

function play(){
    const operation = document.getElementById('operation').value;
    switch(operation){
        case 'Insertion Sorting':
            moves=insertionsort(array);
            break;

        case 'Selection Sorting':
            moves=selectionsort(array);
            break;

        case 'Bubble Sorting':
            moves=bubblesort(array);
                break;

        case 'Quick Sorting':
            moves=quicksort(array);
                break;
    }
}

for(let i=0;i<n;i++){
    array[i]=Math.random();
}

animate();

function bubblesort(array){
    const moves=[];
    do{
        var swapped=false;
        for(let i=1;i<array.length;i++){
            if(array[i-1]>array[i]){
                swapped=true;
                [array[i-1],array[i]]=[array[i],array[i-1]];
                moves.push(
                    {indices:[i-1,i],swap:true}
                );
            }
            else{
                moves.push(
                    {indices:[i-1,i],swap:false}
                );
            }
        }
    }while(swapped);
    return moves;
}

function selectionsort(array){
    const moves=[];
    do{
        var swapped=false;
        for(let i=0;i<array.length-1;i++){
            let minidx=i;
            for(j=i+1;j<=array.length;j++){
                if(array[j]<array[minidx]){
                    minidx=j;
                }
            }
            if(array[minidx]<array[i]){
                swapped=true;
                [array[i],array[minidx]]=[array[minidx],array[i]];
                 moves.push(
                    {indices:[i,minidx],swap:true}
                );
            }
            else{
                moves.push(
                    {indices:[i,minidx],swap:false}
                );
            }
        }
    }while(swapped);
    return moves;
}

function insertionsort(array){
    const moves=[];
    do{
        var swapped=false;
        for(let i=0;i<array.length;i++){
            let key=array[i];
            let j=i-1;
            while(j>=0 && array[j]>key){
                if(array[j]>array[j+1]){
                    swapped=true;
                    [array[j+1],array[j]]=[array[j],array[j+1]];
                    moves.push(
                        {indices:[j+1,j],swap:true}
                    );
                    j--;
                }
                else{
                    moves.push(
                        {indices:[j+1,j],swap:false}
                    );
                }
            }
        }

    }while(swapped);
    return moves;
}   
 
function quicksort(array) {
    const moves = [];

    function partition(arr, low, high) {
        let pivot = arr[high]; // Choosing the last element as pivot
        let i = low - 1; // Pointer for the smaller element

        for (let j = low; j < high; j++) {
            // If current element is smaller than or equal to pivot
            if (arr[j] <= pivot) {
                i++;
                [arr[i], arr[j]] = [arr[j], arr[i]]; // Swap the elements
                moves.push({ indices: [i, j], swap: true });
            } else {
                moves.push({ indices: [i, j], swap: false });
            }
        }

        // Swap the pivot element with the element at i + 1
        [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
        moves.push({ indices: [i + 1, high], swap: true });
        return i + 1; // Return the partition index
    }

    function sort(arr, low, high) {
        if (low < high) {
            const pi = partition(arr, low, high); // Partitioning index
            sort(arr, low, pi - 1); // Recursively sort the left sub-array
            sort(arr, pi + 1, high); // Recursively sort the right sub-array
        }
    }

    sort(array, 0, array.length - 1);
    return moves;
}


function animate(){
    ctx.clearRect(0,0,myCanvas.width,myCanvas.height);
    let changed=false;
    for(let i=0;i<cols.length;i++){
        changed=cols[i].draw(ctx)||changed;
    }
    if(!changed && moves.length>0){
        const move=moves.shift();
        const [i,j]=move.indices;
        if(move.swap){
            cols[i].moveTo(cols[j]);
            cols[j].moveTo(cols[i],-1);
            [cols[i],cols[j]]=[cols[j],cols[i]];
        }
    }

    requestAnimationFrame(animate);
}
  
  
  
  
  
  
  
  
  
  