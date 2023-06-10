// starry_sky.js

// Vertex shader program
"use strict";

// Vertex shader program
const VSHADER_SOURCE =
  '#version 300 es\n' +
  'in vec4 a_Position;\n' +
  'in float a_ScalingCoef;\n' +
  'in float a_OffsetX;\n' +
  'in float a_OffsetY;\n' +
  
  'in float a_RotationOmega;\n' + 
  'uniform float u_Time;\n' + 
  
  'in float a_Alpha;\n' +
  'out float v_Alpha;\n' +
  
  'void main() {\n' +
  '  mat4 a_ScalingMatrix = mat4(a_ScalingCoef, 0.0, 0.0, 0.0,   0.0, a_ScalingCoef, 0.0, 0.0,   0.0, 0.0, a_ScalingCoef, 0.0,  0.0, 0.0, 0.0, 1.0);\n' +
  '  mat4 a_RotationMatrix = mat4(cos(a_RotationOmega * u_Time), sin(a_RotationOmega * u_Time), 0.0, 0.0,   -sin(a_RotationOmega * u_Time), cos(a_RotationOmega * u_Time), 0.0, 0.0,   0.0, 0.0, 1.0, 0.0,  0.0, 0.0, 0.0, 1.0);\n' +
  '  gl_Position = (a_ScalingMatrix * a_Position + vec4(a_OffsetX, a_OffsetY, 0.0, 0.0)) * a_RotationMatrix;\n' + //
  '  gl_PointSize = 10.0;\n' +
  '  v_Alpha = a_Alpha * sin(u_Time / (float(gl_InstanceID) * 0.01) + float(gl_InstanceID));\n' +
  '}\n';

// Fragment shader program
const FSHADER_SOURCE =
  '#version 300 es\n' +
  'precision mediump float;\n' +
 
  'out vec4 FragColor;\n' +
  'in float v_Alpha;\n' +
  
  'void main() {\n' +
  '  FragColor = vec4(1.0, 1.0, 1.0, v_Alpha);\n' +
  '}\n';

function main() {
	
  const {mat2, mat3, mat4, vec2, vec3, vec4} = glMatrix;
	
  // Retrieve <canvas> element
  const canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  const gl = canvas.getContext('webgl2');
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Amount of stars
  let amount = 300;
  
  // Write the positions of vertices to a vertex shader
  const n = initVertexBuffers(gl, amount);
  if (n < 0) {
    console.log('Failed to set the positions of the vertices');
    return;
  }
  
  // Specify the color for clearing <canvas>
  gl.clearColor(0.05, 0.05, 0.15, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
  
  // Blend
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  
  // Depth buffer
   gl.enable(gl.DEPTH_TEST);
   gl.clear(gl.DEPTH_BUFFER_BIT);
 
  // Animation
   let last_time = Date.now();
   
   // Uniform variable of timing for animation	
   const u_Time = gl.getUniformLocation(gl.program, 'u_Time');
   if (u_Time < 0) {
	console.log('Failed to get the storage location of u_Time');
	return;
   }
   
   let time = 0.0;
  
   function animate() {    
	   
	  gl.clear(gl.COLOR_BUFFER_BIT);
	  
   	  let elapsed = (Date.now() - last_time)/1000.0;   
	  time += elapsed;
	  last_time = Date.now();
	   
      gl.uniform1f(u_Time, time);
	   
	  gl.drawElementsInstanced(gl.TRIANGLES, n, gl.UNSIGNED_SHORT, 0, amount);
	  requestAnimationFrame(animate);
   }
   
   animate();
   
}

function initVertexBuffers(gl, amount) {
	
   const {mat2, mat3, mat4, vec2, vec3, vec4} = glMatrix;
   
   // Drawing semi-sphere as an instance for stars
   let latitudeBands = 4;
   let longitudeBands = 8;
   let radius = 0.1;
   
   let vertices_1 = [];
  
   for (let latNumber = 0; latNumber <= latitudeBands; ++latNumber) {
	   
	   let theta = latNumber * Math.PI / latitudeBands;
		   
	   for (let longNumber = 0; longNumber <= longitudeBands; ++longNumber){
		   
		  let phi = longNumber * Math.PI / longitudeBands;
		  
	      let x = Math.sin(theta) * Math.cos(phi);
		  let y = Math.cos(theta);
		  let z = Math.sin(theta) * Math.sin(phi);
		  
		  vertices_1.push(radius * x);
		  vertices_1.push(radius * y);
		  vertices_1.push(radius * z);
		 
	   }
   }
   
   const vertices = new Float32Array(vertices_1);

   let indexData_1 = [];
   for (let latNumber = 0; latNumber < latitudeBands; ++latNumber) {
      
	  for (let longNumber = 0; longNumber < longitudeBands; ++longNumber) {
       
	   let first = (latNumber * (longitudeBands + 1)) + longNumber;

       let second = first + longitudeBands + 1;

       indexData_1.push(first);
       indexData_1.push(second);
       indexData_1.push(first + 1);
      
       indexData_1.push(second);
       indexData_1.push(second + 1);
       indexData_1.push(first + 1);
	   
      }
    }

  const indexData = new Uint16Array(indexData_1);
  const n = indexData.length; // The number of indexes
    
  
  // Create a buffer object
  const buffer1 = gl.createBuffer();
  if (!buffer1) {
    console.log('Failed to create the buffer object');
    return -1;
  }
  
  // Create a buffer object
  const buffer2 = gl.createBuffer();
  if (!buffer2) {
    console.log('Failed to create the buffer object');
    return -1;
  }
  
  // Bind the buffer object to target
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer1);
  
  // Write date into the buffer object
  let FSIZE = indexData.BYTES_PER_ELEMENT * indexData.length;
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, FSIZE , gl.STATIC_DRAW);
  gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER, 0, indexData);


  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer2);
  
  // Write date into the buffer object
  FSIZE = vertices.BYTES_PER_ELEMENT * vertices.length;
  gl.bufferData(gl.ARRAY_BUFFER, FSIZE , gl.STATIC_DRAW);
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, vertices);
  
  
  const a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  
  // Assign the buffer object to a_Position variable
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);

  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);
  
  //---------------------------------------------
  // Instancing
  
  // X offset link
  const a_OffsetX = gl.getAttribLocation(gl.program, 'a_OffsetX');
  if (a_OffsetX < 0) {
    console.log('Failed to get the storage location of a_OffsetX');
    return -1;
  }
  
  // Y offset link
  const a_OffsetY = gl.getAttribLocation(gl.program, 'a_OffsetY');
  if (a_OffsetY < 0) {
    console.log('Failed to get the storage location of a_OffsetY');
    return -1;
  }
  
  // Scaling coefficient
  const a_ScalingCoef = gl.getAttribLocation(gl.program, 'a_ScalingCoef');
  if (a_ScalingCoef < 0) {
    console.log('Failed to get the storage location of a_ScalingCoef');
    return;
  }
  
  // Buffer for offsets and scaling coefficients
  const buffer3 = gl.createBuffer();
  if (!buffer3) {
    console.log('Failed to create the buffer object');
    return -1;
  }
  
  let offsetVector_1 = [];
  let offsetVector_2 = [];
  let diag_coef1 = [];
  
  for (let num = 0; num < amount; ++num) {
	offsetVector_1.push(Math.random() * 2 - 1); 
	offsetVector_2.push(Math.random() * 2 - 1); 
	diag_coef1.push(Math.random() * Math.random() * 0.125);  // Getting a "more random" radius
  }
  
  let offsetVector1 = new Float32Array(offsetVector_1);
  let offsetVector2 = new Float32Array(offsetVector_2);
  let diag_coef = new Float32Array(diag_coef1);
  
  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer3);
  
  // Write data into the buffer object
  FSIZE = offsetVector1.BYTES_PER_ELEMENT * offsetVector1.length + offsetVector2.BYTES_PER_ELEMENT * offsetVector2.length + diag_coef.BYTES_PER_ELEMENT * diag_coef.length;
  gl.bufferData(gl.ARRAY_BUFFER, FSIZE , gl.STATIC_DRAW);
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, offsetVector1);
  gl.bufferSubData(gl.ARRAY_BUFFER, offsetVector1.BYTES_PER_ELEMENT * offsetVector1.length, offsetVector2);
  gl.bufferSubData(gl.ARRAY_BUFFER, offsetVector1.BYTES_PER_ELEMENT * offsetVector1.length + offsetVector2.BYTES_PER_ELEMENT * offsetVector2.length, diag_coef);
  
  
  // Assign the buffer object to a_OffsetX, a_OffsetY, a_ScalingCoef variables
  gl.vertexAttribPointer(a_OffsetX, 1, gl.FLOAT, false, 0, 0);
  gl.vertexAttribPointer(a_OffsetY, 1, gl.FLOAT, false, 0, offsetVector1.BYTES_PER_ELEMENT * offsetVector1.length);
  gl.vertexAttribPointer(a_ScalingCoef, 1, gl.FLOAT, false, 0, offsetVector1.BYTES_PER_ELEMENT * offsetVector1.length + offsetVector2.BYTES_PER_ELEMENT * offsetVector2.length);

  // Enable the assignment to the variables
  gl.enableVertexAttribArray(a_OffsetX);
  gl.enableVertexAttribArray(a_OffsetY);
  gl.enableVertexAttribArray(a_ScalingCoef);
  
  // Setting an attribute divisor 
  gl.vertexAttribDivisor(a_OffsetX, 1);
  gl.vertexAttribDivisor(a_OffsetY, 1);
  gl.vertexAttribDivisor(a_ScalingCoef, 1);	
  
  
  // Angular velocity link
  const a_RotationOmega = gl.getAttribLocation(gl.program, 'a_RotationOmega');
   if (a_RotationOmega < 0) {
	console.log('Failed to get the storage location of a_RotationOmega');
	return;
   }
  
  // Alpha-channel coefficient link
  const a_Alpha = gl.getAttribLocation(gl.program, 'a_Alpha');
   if (a_Alpha < 0) {
	console.log('Failed to get the storage location of a_Alpha');
	return;
   }
   
   let rotationVec_1 = [];
   let alphaVec_1 = [];
   
   for (let num = 0; num < amount; ++num) {
	  rotationVec_1.push(Math.random() * 0.55 + 0.1);
	  alphaVec_1.push(Math.random());
   } 
   
   // Buffer for velocities and alpha coefficients
   const buffer4 = gl.createBuffer();
   if (!buffer4) {
	 console.log('Failed to create the buffer object');
	 return -1;
	}
		
   // Bind the buffer object to target
   gl.bindBuffer(gl.ARRAY_BUFFER, buffer4);
			
   let rotationVec = new Float32Array(rotationVec_1);
   let alphaVec = new Float32Array(alphaVec_1);
   
   // Write data into the buffer object   
   FSIZE = rotationVec.BYTES_PER_ELEMENT * rotationVec.length + alphaVec.BYTES_PER_ELEMENT * alphaVec.length;
   gl.bufferData(gl.ARRAY_BUFFER, FSIZE , gl.STATIC_DRAW);
   gl.bufferSubData(gl.ARRAY_BUFFER, 0, rotationVec);
   gl.bufferSubData(gl.ARRAY_BUFFER, rotationVec.BYTES_PER_ELEMENT * rotationVec.length, alphaVec);
  
  // Assign the buffer object to a_RotationOmega, a_Alpha variables
   gl.vertexAttribPointer(a_RotationOmega, 1, gl.FLOAT, false, 0, 0);
   gl.vertexAttribPointer(a_Alpha, 1, gl.FLOAT, false, 0, rotationVec.BYTES_PER_ELEMENT * rotationVec.length);
   
   // Enable the assignment to the variables
   gl.enableVertexAttribArray(a_RotationOmega);
   gl.enableVertexAttribArray(a_Alpha);
	
   // Setting an attribute divisor
   gl.vertexAttribDivisor(a_RotationOmega, 1);
   gl.vertexAttribDivisor(a_Alpha, 1);

  return n;
}
