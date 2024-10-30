import math


def merge_sort_values(items):
    if len(items) <= 1:
        return items

    mid = len(items) // 2
    left = merge_sort_values(items[:mid])
    right = merge_sort_values(items[mid:])

    return merge_by_value(left, right)

def merge_by_value(left, right):
    sorted_list = []
    while left and right:
        if left[0][1] < right[0][1]:  # Compare by value
            sorted_list.append(left.pop(0))
        else:
            sorted_list.append(right.pop(0))

    # Append any remaining elements
    sorted_list.extend(left if left else right)
    return sorted_list

def sort_dict_by_values(input_dict):
    items = list(input_dict.items())  # Convert to list of (key, value) pairs
    sorted_items = merge_sort_values(items)  # Sort by values using merge sort

    # Build the sorted dictionary
    sorted_dict = {}
    for key, value in sorted_items:
        sorted_dict[key] = value
    return sorted_dict


#minheap for disktraj algorithm
class MinHeap:
    def __init__(self):
        self.heap = []
    
    def parent(self, i):
        return (i - 1) // 2
    
    def left_child(self, i):
        return 2 * i + 1
    
    def right_child(self, i):
        return 2 * i + 2
    
    def insert(self, element):
        self.heap.append(element)
        self.upheap(len(self.heap) - 1)
    
    def extract_min(self):
        if len(self.heap) == 0:
            return None
        if len(self.heap) == 1:
            return self.heap.pop()

        root = self.heap[0]
        self.heap[0] = self.heap.pop()  # Move the last element to the root
        self.downheap(0)
        return root
    

    #when adding node
    def upheap(self, index):
        while index != 0 and self.heap[self.parent(index)][0] > self.heap[index][0]:
            # Swap the node with its parent
            self.heap[index], self.heap[self.parent(index)] = self.heap[self.parent(index)], self.heap[index]
            index = self.parent(index)
    
    #when deleting node
    def downheap(self, index):
        smallest = index
        left = self.left_child(index)
        right = self.right_child(index)

        if left < len(self.heap) and self.heap[left][0] < self.heap[smallest][0]:
            smallest = left

        if right < len(self.heap) and self.heap[right][0] < self.heap[smallest][0]:
            smallest = right

        if smallest != index:
            self.heap[index], self.heap[smallest] = self.heap[smallest], self.heap[index]
            self.downheap(smallest)
    
    def is_empty(self):
        return len(self.heap) == 0

    def decrease_key(self, value, new_distance):
        for i in range(len(self.heap)):
            if self.heap[i][1] == value:
                self.heap[i] = (new_distance, value)
                self.upheap(i)
                break


#Transformer to consumer list which stores data of houses to which electricity  is passed by the particular pole
class PoleToConsumerList:
    
    class Consumer:
        def __init__(self, consumername, currentload, usage):
            self.consumer = consumername
            self.currentload = currentload
            self.usage = usage
            self.prev = None

    def __init__(self) -> None:
        self.tail = None 
        self.size = 0

    def addConsumer(self, name, load, usage):
        new_consumer = self.Consumer(name, load, usage)
        new_consumer.prev = self.tail
        self.tail = new_consumer
        self.size += 1



            

#edge representation of pole to pole wires
class Edge:
    def __init__(self,data,origin,destination):
        self.origin=origin
        self.destination=destination
        self.distance=data

#vertex representation of pole
class Vertex:
    def __init__(self,data,x,y,consumerlist):
        self.data=data
        self.consumerList=consumerlist
        self.position=(x,y)
        self.power=None



#representation of transformer
class Transformer:
    def __init__(self):
        self.powersource=Vertex("power station",0,0,consumerlist=None)
        self.outgoing={self.powersource:{}}
        self.threshhold=50
        self.distances_from_source=None

    def get_distance(self,v,u):
        return math.sqrt((v.position[0] - u.position[0]) ** 2 + (v.position[1] - u.position[1]) ** 2)

    def insert_vertex(self,data,x,y,consumerList):
        v=Vertex(data,x,y,consumerList)
        min_distance=float('inf')
        nearest_vertex=None
        distance_to_v={}
        for vertex in self.outgoing:
            distance=self.get_distance(vertex,v)
            distance_to_v[vertex]=distance
            if distance<min_distance:
                min_distance=distance
                nearest_vertex=vertex

        self.outgoing[v]={}
        self.insert_edge(min_distance,nearest_vertex,v)
        distance_to_v[v]=0
        #applying dijkstra

        least_distance=self.dijkstra(self.powersource.data)
        
        curr_least_distance=min_distance+least_distance[nearest_vertex]
        tmpdistance=curr_least_distance

        for vertex,distance in least_distance.items():
            if distance+distance_to_v[vertex]<curr_least_distance:
                nearest_vertex=vertex
                curr_least_distance=distance+distance_to_v[vertex]

        if(tmpdistance-curr_least_distance>self.threshhold):
            self.insert_edge(curr_least_distance,nearest_vertex,v)    
        

    def get_vertex(self,name):
        for vertex in self.outgoing:
            if vertex.data==name:
                return vertex
            
    def setPower(self,name,power):
        v=self.get_vertex(name)
        if(power==0):
            connected_vetexes=self.dfs(v.data)
            print("conn",connected_vetexes)
            for vertex in connected_vetexes:
                vertex.power=power
        else:
            power=power


    def insert_edge(self,data,u,v):
        e=Edge(data,u,v)
        self.outgoing[u][v]=e

    def dijkstra(self, start):
        # Initialize distances
        start=self.get_vertex(start)
        distances = {vertex: float('inf') for vertex in self.outgoing}
        distances[start] = 0
        
        # MinHeap for priority queue
        min_heap = MinHeap()
        min_heap.insert((0, start))  # (distance, vertex)
        
        while not min_heap.is_empty():
            # Get the vertex with the smallest distance
            current_distance, current_vertex = min_heap.extract_min()

            # If current distance is already greater than known distance, skip
            if current_distance > distances[current_vertex]:
                continue

            # Explore neighbors
            
            for neighbor,edge in self.outgoing[current_vertex].items():
                distance = current_distance + edge.distance
                
                # Only consider this path if it's better
                if distance < distances[neighbor]:
                    distances[neighbor] = distance
                    min_heap.insert((distance, neighbor))
        

        self.distances_from_source=distances
        return distances
    
    def dfs(self,node,visited=None):
        if visited is None:
            visited = set()

        node=self.get_vertex(node)
        visited.add(node)
        

        for neighbor,edge in self.outgoing[node].items():
            if neighbor not in visited:
                self.dfs(neighbor.data,visited)
                return visited

            
    def displayDetails(self):
        for pole,neighbour in self.outgoing.items():
            print(pole.data,pole.power,pole.position)
    
    def transmitPower(self):
        distances=self.distances_from_source
        sorted_distance=sort_dict_by_values(distances)
        for vertex,dist in sorted_distance.items():
            vertex.power=250
            print(vertex.data,vertex.power,dist)
    
    def findDefect(self):
        vertex=self.dfs("power station")
        for v in vertex:
            if v.power==0:
                print(v.data)
                break

            

        


if __name__ == "__main__":
    g=Transformer()
    no_towers=int(input("enter no of towers to be placed : "))
    for i in range(no_towers):
        command=input("enter name and x co-ordinate adn y coordinate : ")
        command=command.split()
        nofconsumers=int(input(f"enter no of consumers for pole {command[0]} : "))
        clist=PoleToConsumerList()
        for j in range(nofconsumers):
            details=input("enter name of consumer load and usage : ")
            details=details.split()
            clist.addConsumer(details[0],int(details[1]),int(details[2]))
        g.insert_vertex(command[0],int(command[1]),int(command[2]),clist)
    
    while True:
        maincommand=int(input("enter your command \n1)transmit power\n2)set power\n3)find defect\n4)display details\n"))
        if maincommand==1:
            g.transmitPower()
        elif maincommand==2:
            g.setPower("t1",0)
        elif maincommand==3:
            g.findDefect()
        elif maincommand==4:
            g.displayDetails()
        else:
            print("invalid input")
            break

    
