"use strict";

var Tessellator = {

  generatePolygonVertices: 
    function(polygonVertexCount, boundingRadius){
      boundingRadius = boundingRadius || 0.3;
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

  generatePolystarTriangles: 
    function(polygonVertices, starReach){

      starReach = starReach || 1.2;
      var vertexCount = polygonVertices.length;
      var polyTriangles = Tessellator.generatePolygonTriangles(polygonVertices);
      var starTriangles = new Array(vertexCount * 2);

      // affix additional triangle to each polygon triangle's base
      for(var tIndex = 0; tIndex < vertexCount; tIndex++)
      {
        starTriangles[tIndex*2] = polyTriangles[tIndex];

        var b = polyTriangles[tIndex][1];
        var c = polyTriangles[tIndex][2];
        var bx = b[0], by = b[1];
        var cx = c[0], cy = c[1];

        var a = [
          (bx+cx)/2 + starReach*(cy-by), 
          (by+cy)/2 - starReach*(cx-bx)
          ];

        starTriangles[tIndex*2+1] = [a,b,c];
      }

      return starTriangles;
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
    function(polygonVertexCount, subdivisions, rotation, constant, makeStar)
    {
      var makeStar = makeStar || false;
      var polygonVertices = Tessellator.generatePolygonVertices(polygonVertexCount);

      var polygonTriangles = makeStar ? 
        Tessellator.generatePolystarTriangles(polygonVertices) : 
        Tessellator.generatePolygonTriangles(polygonVertices);

      var vertices = []; var edges = [];
      polygonTriangles.forEach(function(triangle){
        var triangleAttributes = Tessellator.divideTriangle(triangle, subdivisions, rotation, constant);
        vertices = vertices.concat(triangleAttributes.vertices);
        edges = edges.concat(triangleAttributes.edges);
      });

      return {vertices: vertices, edges: edges};
    }
};

