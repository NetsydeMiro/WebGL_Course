"use strict";

var Tessellator = {

  generatePolygonVertices: 
    function(polygonVertexCount, boundingRadius){
      boundingRadius = boundingRadius || 0.7;
      var polygonVertices = new Array(polygonVertexCount); 

      var angleIncrement = 2.0 * Math.PI / polygonVertexCount;

      // generate the polygon outline
      for(var vIndex = 0; vIndex < polygonVertexCount; vIndex++){
        var x = boundingRadius * Math.cos(vIndex * angleIncrement);
        var y = boundingRadius * Math.sin(vIndex * angleIncrement);

        polygonVertices[vIndex] = [x, y]; 
      }

      return polygonVertices;
    }, 

  generatePolygonTriangles: 
    function(polygonVertices){

      var vertexCount = polygonVertices.length;
      var triangles = new Array(vertexCount);

      // break it into triangle subcomponents, which meet at poly's centroid (the origin)
      for(var tIndex = 0; tIndex < vertexCount; tIndex++)
      {
        var a = [0,0];
        var b = polygonVertices[tIndex];
        var c = polygonVertices[tIndex < vertexCount - 1 ? tIndex + 1 : 0]

          triangles[tIndex] = [a, b, c];
      }

      return triangles;
    }, 

  divideTriangle: 
    function(triangle, subdivisions, rotation, constant)
    {

      var helper = function(triangle, count, rotation, constant, vertices, edges){
        // end recursion
        if (count == 0) {
          var transformed_vertices = triangle.map(function(vertex){
            var x = vertex[0]; var y = vertex[1];
            var d = Math.pow(Math.pow(x, 2) + Math.pow(y, 2), 0.5);

            var rotation_prime = rotation * d * constant;

            var x_prime = x * Math.cos(rotation_prime) - y * Math.sin(rotation_prime);
            var y_prime = x * Math.sin(rotation_prime) + y * Math.cos(rotation_prime);

            return [x_prime, y_prime]; 
          });

          vertices.push(transformed_vertices[0], transformed_vertices[1], transformed_vertices[2]);

          edges.push(transformed_vertices[0], transformed_vertices[1], 
              transformed_vertices[1], transformed_vertices[2], 
              transformed_vertices[2], transformed_vertices[0]);
        }
        else {

          //bisect the sides
          var a = triangle[0], b = triangle[1], c = triangle[2];
          var ab = mix(a, b, 0.5);
          var ac = mix(a, c, 0.5);
          var bc = mix(b, c, 0.5);

          --count;

          // four new triangles
          helper([a, ab, ac], count, rotation, constant, vertices, edges);
          helper([c, ac, bc], count, rotation, constant, vertices, edges);
          helper([b, bc, ab], count, rotation, constant, vertices, edges);
          helper([ab, ac, bc], count, rotation, constant, vertices, edges);
        }

      }

      var vertices = [], edges = [];

      helper(triangle, subdivisions, rotation, constant, vertices, edges);

      return {vertices: vertices, edges: edges};
    }, 

  getTriangleBuffers: 
    function(polygonVertexCount, subdivisions, rotation, constant)
    {
      var polygonVertices = Tessellator.generatePolygonVertices(polygonVertexCount);

      var polygonTriangles = Tessellator.generatePolygonTriangles(polygonVertices);

      var vertices = []; var edges = [];
      polygonTriangles.forEach(function(triangle){
        var triangleAttributes = Tessellator.divideTriangle(triangle, subdivisions, rotation, constant);
        vertices = vertices.concat(triangleAttributes.vertices);
        edges = edges.concat(triangleAttributes.edges);
      });

      return {vertices: vertices, edges: edges};
    }
};

