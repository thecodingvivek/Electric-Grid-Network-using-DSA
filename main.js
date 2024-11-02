const canvas = document.getElementById('canv');
const coordsDisplay = document.getElementById('coords');
const ctx = canvas.getContext('2d');
const pole=new Image();
pole.src="pole.png";
var i=0;


const g = new Transformer(460,356);

canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    showAddDiv(rect,x,y);
});


function showAddDiv(rect,x,y){
    let add=document.getElementsByClassName("addpoint")[0];
    let btn=document.getElementsByClassName("addbtn")[0];
    add.style.display="flex";
    add.style.left= `${rect.left + x}px`;
    add.style.top= `${rect.top + y}px`;
    btn.onclick=()=>closeAddDiv(rect,x,y);
}

function closeAddDiv(rect,x,y){
    let add=document.getElementsByClassName("addpoint")[0];
    
    coordsDisplay.textContent = `X: ${x}  Y: ${y}`;
    g.insertVertex("t"+i,x,y,createDiv(rect,x,y,i));
    i++;
    new Promise((resolve) => {
        drawGraph();
        resolve();
    }).then(()=>{
        createGraphReprentations();
    });
    add.style.display="none";
}

function createDiv(rect,x,y,i)
{
    let div=document.createElement('div');
    div.className="pole";
    div.style.left= `${rect.left + x}px`;
    div.style.top= `${rect.top + y}px`;

    let btncont=document.createElement('div');

    btncont.className="pole_before";
    btncont.id="t"+i;

    btncont.style.display="none";
    let sp=document.createElement('div');
    sp.className="stoppower";
    sp.innerHTML="stop power"

    div.onclick=()=>{
        btncont.style.display="flex";
    }

    btncont.appendChild(sp);

    sp.onclick=()=>{
        setPower("t"+i,0);
    };

    div.appendChild(btncont);
    document.body.appendChild(div);

    return div;
}



// Resize canvas to full screen
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    drawGraph(); // Redraw the graph after resizing
}

// Draw X and Y axis
function drawAxes() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // X-axis
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(canvas.width, centerY);
    ctx.strokeStyle = 'gray';
    ctx.stroke();
    ctx.closePath();

    // Y-axis
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, canvas.height);
    ctx.strokeStyle = 'gray';
    ctx.stroke();
    ctx.closePath();
}

// Plot points based on given coordinates
function plotPoint(x, y, color = 'blue') {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const scale = 20; // scale factor to adjust the unit size

    // Translate coordinates to canvas space
    const canvasX = centerX + x * scale;
    const canvasY = centerY - y * scale;

    // Draw point
    g.setorigin(canvasX,canvasY);
    ctx.beginPath();
    ctx.arc(canvasX, canvasY, 5, 0, 2 * Math.PI, false);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();
}

// Draw the graph with axes and points
function drawGraph() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas
    drawAxes();
    plotPoint(0, 0, 'red');
}


function createGraphReprentations(){
    const context = canvas.getContext('2d');
    console.log(g.outgoing);
    for(let [vertex,neighbor] of g.outgoing)
    {
        console.log('yoo',vertex);
        context.fillStyle = '#0a9396';
        context.beginPath();
        context.arc(vertex.position[0], vertex.position[1], 5, 0, Math.PI * 2);
        context.fill();
    }
    drawEdges();
}


function drawEdges(){
    for(let [vertex,neighbor] of g.outgoing)
    {
        for(let [v,edge] of neighbor)
        {
            ctx.moveTo(vertex.position[0],vertex.position[1]);
            ctx.lineTo(v.position[0],v.position[1]);
            ctx.strokeStyle = "#343a40";
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.closePath();
        }
    }
}


function transmit(){
    let sortedDistance=g.transmitPower();
    let delay=0;
    for (const [vertex,dis] of sortedDistance) {
        vertex.power = 250;
        setTimeout(()=>{
            drawPoint(vertex.position[0],vertex.position[1],"gold");
            vertex.representative.style.borderColor="#b69121";
        },500+(500*delay));
        delay++;
    }
}

function setPower(name,power){
    let ver=g.dfs(name);
    console.log(name);
    let delay=0;
    ver.forEach((vertex)=>{
        setTimeout(()=>{
            vertex.power=power;
            drawPoint(vertex.position[0],vertex.position[1],"red");
            vertex.representative.querySelectorAll('.pole_before').forEach((v)=>{
                v.style.display="none";
            });
            vertex.representative.style.borderColor="#ffffff25";
        },500+(500*delay));
        delay++;
    });
}

function FindError(){
    let v=g.checkerror("power station");
    let delay=0;
    let prev=[];
    let m=true;
    for(let vertex of v)
    {
        if(vertex.power==0)
        {
            setTimeout(()=>{
                drawPoint(vertex.position[0],vertex.position[1],"white");
                vertex.representative.style.borderColor="white";

            },500+(delay*500));
        
            m=false;
            setTimeout(()=>{
                let prevvertex=prev.shift();
                drawPoint(prevvertex.position[0],prevvertex.position[1],"gold");
                vertex.representative.style.borderColor="#b69121";
            },500);
            break;
        }
        else{
            setTimeout(()=>{
                drawPoint(vertex.position[0],vertex.position[1],"green");
                vertex.representative.style.borderColor="green";
                prev.push(vertex);
                if (prev.length != 1 ){
                    setTimeout(()=>{
                        let prevvertex=prev.shift();
                        drawPoint(prevvertex.position[0],prevvertex.position[1],"gold");
                        vertex.representative.style.borderColor="#b69121";
                    },500);
                }
            },500+(500*delay));
            delay++;
        }
    }
}

function showPoleOptions(event){
    alert(event.target.id);
}

function drawPoint(x,y,color){
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x,y, 5, 0, Math.PI * 2);
    ctx.fill();
}

// Initial setup and event listeners
window.addEventListener('resize', resizeCanvas); // Handle window resize
resizeCanvas(); // Set initial canvas size