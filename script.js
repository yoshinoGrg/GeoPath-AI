// ==============================
// GeoPath AI - Interactive Map
// ==============================

// Create Map
const map = L.map('map', {

    zoomControl: false,
    preferCanvas: true

}).setView(
    [22.9734, 78.6569],
    5
);

// ==============================
// Dark AI Tile Layer
// ==============================

L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png',
    {
        attribution:
        '&copy; OpenStreetMap & CartoDB',

        subdomains: 'abcd',

        maxZoom: 20
    }
).addTo(map);

// Zoom Controls
L.control.zoom({
    position: 'bottomright'
}).addTo(map);

// ==============================
// Variables
// ==============================

let cities = [];

let graph = {};

let highlightedRoutes = [];

let selectedStart = null;

let selectedEnd = null;

// ==============================
// Load Cities
// ==============================

function loadCities() {

    const locations = [

        ["Delhi", 28.6139, 77.2090],

        ["Mumbai", 19.0760, 72.8777],

        ["Kolkata", 22.5726, 88.3639],

        ["Chennai", 13.0827, 80.2707],

        ["Bangalore", 12.9716, 77.5946]

    ];

    locations.forEach(city => {

        const marker = L.circleMarker(

            [city[1], city[2]],

            {
                radius: 12,

                fillColor: "#38bdf8",

                color: "#0f172a",

                weight: 2,

                opacity: 1,

                fillOpacity: 1
            }

        ).addTo(map);

        marker.bindPopup(city[0]);

        // Click Event
        marker.on("click", () => {

            handleCitySelection(city[0]);

        });

        cities.push({

            name: city[0],

            lat: city[1],

            lng: city[2]

        });

        graph[city[0]] = {};
    });

    connectCities();

    document.getElementById(
        "result"
    ).innerHTML =

    `
    Click a city to select
    starting location.
    `;
}

// ==============================
// Connect Cities
// ==============================

function connectCities() {

    connect("Delhi", "Mumbai", 10);

    connect("Delhi", "Kolkata", 4);

    connect("Mumbai", "Bangalore", 6);

    connect("Kolkata", "Chennai", 7);

    connect("Bangalore", "Chennai", 3);
}

// ==============================
// Connect Function
// ==============================

function connect(a, b, weight) {

    graph[a][b] = weight;

    graph[b][a] = weight;

    const cityA =
        cities.find(c => c.name === a);

    const cityB =
        cities.find(c => c.name === b);

    // Base Route
    L.polyline(

        [
            [cityA.lat, cityA.lng],
            [cityB.lat, cityB.lng]
        ],

        {
            color: "#334155",

            weight: 3,

            opacity: 0.7,

            smoothFactor: 1.5
        }

    ).addTo(map);
}

// ==============================
// Handle City Selection
// ==============================

function handleCitySelection(cityName){

    // Select Start
    if(!selectedStart){

        selectedStart = cityName;

        document.getElementById(
            "result"
        ).innerHTML =

        `
        <b>Start City:</b>
        ${selectedStart}

        <br><br>

        Select destination city.
        `;

        return;
    }

    // Prevent same city
    if(cityName === selectedStart){

        return;
    }

    // Destination
    selectedEnd = cityName;

    runDijkstra(
        selectedStart,
        selectedEnd
    );
}

// ==============================
// Dijkstra Algorithm
// ==============================

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

// ==============================
// Build Path
// ==============================

function getPath(previous, end) {

    let path = [];

    let current = end;

    while (current !== null) {

        path.unshift(current);

        current = previous[current];
    }

    return path;
}

// ==============================
// Run Dijkstra
// ==============================

function runDijkstra(start, end){

    const result =
        dijkstra(graph, start);

    const path =
        getPath(
            result.previous,
            end
        );

    highlightPath(path);

    document.getElementById(
        "result"
    ).innerHTML =

    `
    <b>Start:</b>
    ${start}

    <br><br>

    <b>Destination:</b>
    ${end}

    <br><br>

    <b>Shortest Route:</b>
    ${path.join(" → ")}

    <br><br>

    <b>Total Distance:</b>
    ${result.distances[end]}
    `;
}

// ==============================
// Highlight Route
// ==============================

function highlightPath(path){

    // Remove old route
    highlightedRoutes.forEach(
        line => map.removeLayer(line)
    );

    highlightedRoutes = [];

    for(let i = 0; i < path.length - 1; i++){

        const cityA =
            cities.find(
                c => c.name === path[i]
            );

        const cityB =
            cities.find(
                c => c.name === path[i + 1]
            );

        // Glow Layer
        const glow = L.polyline(

            [
                [cityA.lat, cityA.lng],
                [cityB.lat, cityB.lng]
            ],

            {
                color:"#00ffe5",

                weight:12,

                opacity:0.18,

                smoothFactor:1.5
            }

        ).addTo(map);

        // Main Route
        const line = L.polyline(

            [
                [cityA.lat, cityA.lng],
                [cityB.lat, cityB.lng]
            ],

            {
                color:"#00ffe5",

                weight:5,

                opacity:1,

                smoothFactor:1.5
            }

        ).addTo(map);

        highlightedRoutes.push(glow);

        highlightedRoutes.push(line);
    }
}

// ==============================
// Reset System
// ==============================

function resetMap(){

    highlightedRoutes.forEach(
        line => map.removeLayer(line)
    );

    highlightedRoutes = [];

    selectedStart = null;

    selectedEnd = null;

    document.getElementById(
        "result"
    ).innerHTML =

    `
    Click a city to select
    starting location.
    `;
}

// ==============================
// Auto Load
// ==============================

window.onload = () => {

    loadCities();

};
