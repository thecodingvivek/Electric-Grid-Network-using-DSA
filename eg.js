class MinHeap {
    constructor() {
        this.heap = [];
    }

    parent(i) {
        return Math.floor((i - 1) / 2);
    }

    leftChild(i) {
        return 2 * i + 1;
    }

    rightChild(i) {
        return 2 * i + 2;
    }

    insert(element) {
        this.heap.push(element);
        this.upheap(this.heap.length - 1);
    }

    extractMin() {
        if (this.heap.length === 0) return null;
        if (this.heap.length === 1) return this.heap.pop();

        const root = this.heap[0];
        this.heap[0] = this.heap.pop(); // Move the last element to the root
        this.downheap(0);
        return root;
    }

    upheap(index) {
        while (index !== 0 && this.heap[this.parent(index)][0] > this.heap[index][0]) {
            // Swap the node with its parent
            [this.heap[index], this.heap[this.parent(index)]] = [this.heap[this.parent(index)], this.heap[index]];
            index = this.parent(index);
        }
    }

    downheap(index) {
        let smallest = index;
        const left = this.leftChild(index);
        const right = this.rightChild(index);

        if (left < this.heap.length && this.heap[left][0] < this.heap[smallest][0]) {
            smallest = left;
        }

        if (right < this.heap.length && this.heap[right][0] < this.heap[smallest][0]) {
            smallest = right;
        }

        if (smallest !== index) {
            [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
            this.downheap(smallest);
        }
    }

    isEmpty() {
        return this.heap.length === 0;
    }

    decreaseKey(value, newDistance) {
        for (let i = 0; i < this.heap.length; i++) {
            if (this.heap[i][1] === value) {
                this.heap[i] = [newDistance, value];
                this.upheap(i);
                break;
            }
        }
    }
}

class TransformerToConsumerList {
    constructor() {
        this.tail = null;
        this.size = 0;
    }

    addConsumer(name, load, usage) {
        const newConsumer = new TransformerToConsumerList.Consumer(name, load, usage);
        if (this.size === 0) {
            this.tail = newConsumer;
        } else {
            newConsumer.prev = this.tail;
            this.tail = newConsumer;
        }
        this.size++;
    }

    displayConsumers() {
        let a = this.tail;
        while (a) {
            console.log(a.consumer);
            a = a.prev;
        }
    }
}

TransformerToConsumerList.Consumer = class {
    constructor(consumerName, currentLoad, usage) {
        this.consumer = consumerName;
        this.currentLoad = currentLoad;
        this.usage = usage;
        this.prev = null;
    }
};

class Edge {
    constructor(data, origin, destination) {
        this.origin = origin;
        this.destination = destination;
        this.distance = data;
    }
}

class Vertex {
    constructor(data, x, y,consumerList,representative) {
        this.data = data;
        this.consumerList = consumerList;
        this.position = [x, y];
        this.power = null;
        this.representative=representative;
    }
}

class Transformer {
    constructor(mx,my) {
        this.powerSource = new Vertex("power station", mx, my, null);
        this.outgoing = new Map();
        this.outgoing.set(this.powerSource,new Map());
        this.distancesFromSource = null;
        this.thresholdDistance=1;
    }

    setorigin(x,y){
        this.powerSource.position[0]=x;
        this.powerSource.position[1]=y;
    }

    setThresHold(d){
        this.thresholdDistance=d;
    }
    



    getDistance(v, u) {
        console.log(v.position,u.position);
        return Math.sqrt(Math.pow(v.position[0] - u.position[0], 2) + Math.pow(v.position[1] - u.position[1], 2));
    }

    insertVertex(data, x, y,rep) {
        const consumerList = new TransformerToConsumerList();
        consumerList.addConsumer("vivek", 5.4, 5);
        consumerList.addConsumer("dhruva", 5.4, 5);
        const v = new Vertex(data, x, y, consumerList,rep);
        

        let minDistance = Infinity;
        let nearestVertex = null;
        const distanceToV = new Map();

        console.log("ok");

        for (const [vertex,dist] of this.outgoing) {
            console.log("lol",vertex);
            const distance = this.getDistance(vertex, v);
            distanceToV.set(vertex,distance);
            if (distance < minDistance) {
                minDistance = distance;
                nearestVertex = vertex;
            }
        }
        

        this.outgoing.set(v,new Map());

        this.insertEdge(minDistance, nearestVertex, v);
        distanceToV.set(v,0);

        // Applying Dijkstra
        const leastDistance = this.dijkstra(this.powerSource.data);
        console.log("lolss",leastDistance);
        
        let currLeastDistance = minDistance + leastDistance.get(nearestVertex);
        let tmpdistance=currLeastDistance;
        console.log("crrld  ",currLeastDistance);

        for (const [vertex,dis] of leastDistance) {
            console.log("going in");
            if (leastDistance.get(vertex) + distanceToV.get(vertex) < currLeastDistance) {
                nearestVertex = vertex;
                currLeastDistance = leastDistance.get(vertex) + distanceToV.get(vertex);
            }
        }

        console.log("from source",currLeastDistance);
        console.log("threshold",tmpdistance-currLeastDistance);
        this.thresholdDistance=50;

        if(tmpdistance-currLeastDistance>this.thresholdDistance)
        {
            this.insertEdge(currLeastDistance, nearestVertex, v);
            console.log("finall",this.outgoing);
        }

    }

    getVertex(name) {
        for (const [vertex,ed] of this.outgoing) {
            if (vertex.data === name) {
                console.log("same",vertex.data);
                return vertex;
            }
        }
    }

    insertEdge(data, u, v) {
        const e = new Edge(data, u, v);
        this.outgoing.get(u).set(v,e);
    }

    dijkstra(start) {
        start = this.getVertex(start);
        const distances = new Map();
        for (const [vertex,ed] of this.outgoing) {
            distances.set(vertex,Infinity);
        }
        distances.set(start,0);
        const minHeap = new MinHeap();
        minHeap.insert([0, start]); // (distance, vertex)

        while (!minHeap.isEmpty()) {
            const [currentDistance, currentVertex] = minHeap.extractMin();
            console.log("cd",currentDistance,currentVertex);

            // If current distance is already greater than known distance, skip
            console.log(currentDistance,distances.get(currentVertex));
            if (currentDistance > distances.get(currentVertex)) {
                continue;
            }


            // Explore neighbors
            for (const [neighbor,edge] of this.outgoing.get(currentVertex)) {
                console.log("yamoo",currentDistance,edge.distance);
                let distance = currentDistance + edge.distance;
                console.log("distance",distance);
                // Only consider this path if it's better
                if (distance < distances.get(neighbor)) {
                    distances.set(neighbor,distance);
                    minHeap.insert([distance, neighbor]);
                }
            }
        }

        this.distancesFromSource = distances;
        return distances;
    }

    transmitPower() {
        const distances = this.distancesFromSource;
        const sortedDistance = this.sortMapByValues(distances);
        return sortedDistance;
    }

    sortMapByValues(inputMap) {
        const items = Array.from(inputMap.entries()); // Convert Map to an array of [key, value] pairs
        const sortedItems = this.mergeSortValues(items); // Sort by values using merge sort
    
        return new Map(sortedItems);
    }
    
    mergeSortValues(items) {
        if (items.length <= 1) {
            return items;
        }
    
        const mid = Math.floor(items.length / 2);
        const left = this.mergeSortValues(items.slice(0, mid));
        const right = this.mergeSortValues(items.slice(mid));
    
        return this.mergeByValue(left, right);
    }
    
    mergeByValue(left, right) {
        const sortedList = [];
        while (left.length && right.length) {
            if (left[0][1] < right[0][1]) { // Compare by value
                sortedList.push(left.shift());
            } else {
                sortedList.push(right.shift());
            }
        }
    
        // Append any remaining elements
        return sortedList.concat(left.length ? left : right);
    }



    dfs(node, visited = new Set()) {
        node = this.getVertex(node);

        visited.add(node);

        console.log("dfs",node);
        for (const [neighbor,distance] of this.outgoing.get(node)) {
            if (!visited.has(neighbor) &&  !this.outgoing.get(this.getVertex("power station")).has(neighbor)) {
                this.dfs(neighbor.data, visited);
            }
        }

        return visited;
    }



    checkerror(node, visited = new Set()){
        node = this.getVertex(node);

        visited.add(node);

        for (const [neighbor,distance] of this.outgoing.get(node)) {
            if (!visited.has(neighbor)) {
                this.dfs(neighbor.data, visited);
            }
        }

        return visited;
    }
    
}



