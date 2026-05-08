const map = L.map('map').setView(
    [22.9734, 78.6569],
    5
);

L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
        attribution:
            '&copy; OpenStreetMap contributors'
    }
).addTo(map);

let cities = [];

let graph = {};

let routeLines = [];

function loadCities() {

    resetMap();

    const locations = [

        ["Delhi", 28.6139, 77.2090],
        ["Mumbai", 19.0760, 72.8777],
        ["Kolkata", 22.5726, 88.3639],
        ["Chennai", 13.0827, 80.2707],
        ["Bangalore", 12.9716, 77.5946]

    ];

    locations.forEach(city => {

        const marker = L.marker(
            [city[1], city[2]]
        ).addTo(map);

        marker.bindPopup(city[0]);

        cities.push({
            name: city[0],
            lat: city[1],
            lng: city[2]
        });

        graph[city[0]] = {};
    });

    connectCities();
}

function connectCities() {

    connect("Delhi", "Mumbai", 10);

    connect("Delhi", "Kolkata", 4);

    connect("Mumbai", "Bangalore", 6);

    connect("Kolkata", "Chennai", 7);

    connect("Bangalore", "Chennai", 3);
}

function connect(a, b, weight) {

    graph[a][b] = weight;

    graph[b][a] = weight;

    const cityA =
        cities.find(c => c.name === a);

    const cityB =
        cities.find(c => c.name === b);

    const line = L.polyline(
        [
            [cityA.lat, cityA.lng],
            [cityB.lat, cityB.lng]
        ],
        {
            color: "#64748b",
            weight: 3
        }
    ).addTo(map);

    routeLines.push(line);
}

function dijkstra(graph, start) {

    let distances = {};

    let previous = {};

    let visited = {};

    for (let node in graph) {

        distances[node] = Infinity;

        previous[node] = null;
    }

    distances[start] = 0;

    while (true) {

        let closestNode = null;

        for (let node in distances) {

            if (!visited[node]) {

                if (
                    closestNode === null ||

                    distances[node] <
                    distances[closestNode]
                ) {
                    closestNode = node;
                }
            }
        }

        if (closestNode === null)
            break;

        visited[closestNode] = true;

        for (
            let neighbor
            in graph[closestNode]
        ) {

            let newDistance =

                distances[closestNode] +

                graph[closestNode][neighbor];

            if (
                newDistance <
                distances[neighbor]
            ) {

                distances[neighbor] =
                    newDistance;

                previous[neighbor] =
                    closestNode;
            }
        }
    }

    return {
        distances,
        previous
    };
}

function getPath(previous, end) {

    let path = [];

    let current = end;

    while (current !== null) {

        path.unshift(current);

        current = previous[current];
    }

    return path;
}

function runDijkstra() {

    const result =
        dijkstra(graph, "Delhi");

    const path =
        getPath(
            result.previous,
            "Chennai"
        );

    highlightPath(path);

    document.getElementById(
        "result"
    ).innerHTML =

        `
        <b>Shortest Route:</b>
        ${path.join(" → ")}

        <br><br>

        <b>Total Distance:</b>
        ${result.distances["Chennai"]}
        `;
}

function highlightPath(path) {

    for (let i = 0; i < path.length - 1; i++) {

        const cityA =
            cities.find(
                c => c.name === path[i]
            );

        const cityB =
            cities.find(
                c => c.name === path[i + 1]
            );

        L.polyline(
            [
                [cityA.lat, cityA.lng],
                [cityB.lat, cityB.lng]
            ],
            {
                color: "#22c55e",
                weight: 6
            }
        ).addTo(map);
    }
}

function resetMap() {

    map.eachLayer(layer => {

        if (
            layer instanceof L.Marker ||

            layer instanceof L.Polyline
        ) {
            map.removeLayer(layer);
        }
    });

    cities = [];

    graph = {};
}