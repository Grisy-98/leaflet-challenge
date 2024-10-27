// Save the geoJSON 
let link = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"


// Perform a GET request of the URL

d3.json(link).then(function(data) {
    console.log(data);
    //Once we get a response, send the data.features object to the createFeatures function.
    createFeatures(data.features);
});

// Size of the marker will depend on the magnitude of the earthquake
function markerSize(magnitude) {
    return magnitude*10000;
};

function markerColor(depth) {
    if (depth> 90) return "red";
    else if (depth > 70) return "orangered";
    else if (depth > 50) return "orange";
    else if (depth > 30) return "yellow";
    else if (depth > 10) return "greenyellow";
    else return "green"
};

function createFeatures(earthquakeData) {
    //Define a function to run once for each feature in the features array
    // Give each feature a popup that describes the location, date, magnitude, and depth of the earthquakes
    function onEachFeature(feature, layer) {
        layer.bindPopup(`<h3>Location: ${feature.properties.place}</h3><hr><p>Date: ${new Date(feature.properties.time)}</p><p>Magnitude: ${feature.properties.mag}</p><p>Depth: ${feature.geometry.coordinates[2]}</p>`);
      }
    
    let earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: function(feature, latlng) {
            let markers = {
                radius: markerSize(feature.properties.mag),
                    fillColor: markerColor(feature.geometry.coordinates[2]),
                    fillOpacity: 0.8,
                    stroke: false
            }
            return L.circle(latlng, markers);
        }
    });

    //Send the earthquake layer to the createMap function
    createMap(earthquakes);
}

function createMap(earthquakes) {
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });
    let baseMap = {
        "Street Map": street
    };
    let overlayMaps = {
        Earthquakes: earthquakes
    };
    let myMap = L.map("map", {
        center: [36.07, -100.81],
        zoom: 5,
        layers: [street, earthquakes]
    });

// Create a legend
// https://leafletjs.com/examples/choropleth/ to help figure out how to create the legend
let legend = L.control({position: "bottomright"});
legend.onAdd = function(map) {
    let div = L.DomUtil.create("div", "info legend"),
    labels = ["<strong>Depth</strong>"],
    depth = [-10, 10, 30, 50, 70, 90];
  
    div.innerHTML += "<h3 style='text-align: center'>Depth</h3>"
  
    for (var i = 0; i < depth.length; i++) {
      div.innerHTML +=
      labels.push(
      '<i class="circle" style="background:' + markerColor(depth[i] + 1) + '"></i> ' + depth[i] + (depth[i + 1] ? '&ndash;' + depth[i + 1] + '<br>' : '+'));
    }
    div.innerHTML = labels.join('<br>')
    return div;
  };
  legend.addTo(myMap)

   // Create a layer control.
  // Pass it our baseMaps and overlayMaps.
  // Add the layer control to the map.
    L.control.layers(baseMap, overlayMaps, {
        collapsed: false
    }).addTo(myMap);
}
