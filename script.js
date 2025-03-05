const width =1000, height = 1000;

// Projection adaptée à EPSG:3857 (Web Mercator)
const projection = d3.geoMercator()
    .center([2.454071, 46.279229]) // Centrage sur la France
    .scale(3000) 
    .translate([width/2, height/2]);

const path = d3.geoPath().projection(projection);

const svg = d3.select("#map")
    .attr("width", width)
    .attr("height", height);

// Fonction pour calculer les centroïdes et les projeter
function calculateCentroids(regions, projection) {
    let regionCenters = [];

    regions.features.forEach(region => {
        // Calculer le centroïde de la région
        const centroid = d3.geoCentroid(region);  // Calculer le centroïde de la géométrie
        // Ajouter les données dans le tableau sous le format demandé
        regionCenters.push({
            country: region.properties.nom,  // Nom de la région
            code: region.properties.code,  // Code de la région
            coordinates: centroid  // Coordonnées projetées du centroïde
        });
    });

    return regionCenters;
}

// Chargement des fichiers GeoJSON et flux JSON
Promise.all([
    d3.json("data/maps/regions2.geojson"),
    d3.json("data/maps/centroids.json"),
    d3.json("data/flux/flux_fluvial_2019.json")
]).then(([regions, centroids, flows]) => {

    const regionCenters = calculateCentroids(regions, projection);

    // Dessiner les régions et enregistrer les centroïdes
    svg.selectAll(".region")
        .data(regions.features)
        .enter().append("path")
        .attr("class", "region")
        .attr("d", path)
        .attr("fill", "#6baed6")  // Bleu clair
        .attr("stroke", "#08306b") // Bleu foncé
        .attr("stroke-width", 1.5)
        
    // Dessiner les centroïdes des régions (rouge)
    svg.selectAll(".region-center")
        .data(Object.entries(centroids))
        .enter().append("circle")
        .attr("class", "region-center")
        .attr("cx", d => d[1][0])
        .attr("cy", d => d[1][1])
        .attr("r", 5)
        .attr("fill", "red");

console.log("region Centre est:", regionCenters);

// Dessiner les points des pays extérieurs (vert)
let countryCenters = {}; // Stocker les coordonnées des pays
svg.selectAll(".country-point")
    .data(centroids)
    .enter().append("circle")
    .attr("class", "country-point")
    .attr("cx", d => projection(d.coordinates)[0])
    .attr("cy", d => projection(d.coordinates)[1])
    .attr("r", 5)
    .attr("fill", "green")
    .each(d => {
        centroids[d.code] = projection(d.coordinates);
    });

// Dessiner les flux de transport sous forme de lignes
svg.selectAll(".flow")
    .data(flows)
    .enter().append("line")
    .attr("class", "flow")
    .attr("x1", d => centroids[d.source] ? centroids[d.source][0] : 0)
    .attr("y1", d => centroids[d.source] ? centroids[d.source][1] : 0)
    .attr("x2", d => centroids[d.target] ? centroids[d.target][0] : 0)
    .attr("y2", d => centroids[d.target] ? centroids[d.target][1] : 0)
    .attr("stroke", "steelblue")
    .attr("stroke-width", d => Math.sqrt(d.volume) * 0.1)
    .attr("stroke-opacity", 0.7);

});
