import { DogModelConfig } from './dogModels'

export function generateDogSceneHtml(
  config: DogModelConfig,
  colors: { primary: string; secondary: string }
): string {
  const { bodyLength, bodyHeight, legLength, headSize, earType, tailType, snoutLength } = config
  const { primary, secondary } = colors

  return `<!DOCTYPE html>
<html><head><meta name="viewport" content="width=device-width,initial-scale=1">
<style>*{margin:0;padding:0}body{overflow:hidden;background:#FFFBE6}canvas{display:block}</style>
</head><body>
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script>
(function(){
  var W=window.innerWidth, H=window.innerHeight;
  var scene=new THREE.Scene();
  scene.background=new THREE.Color(0xFFFBE6);
  var camera=new THREE.PerspectiveCamera(40,W/H,0.1,100);
  camera.position.set(3,2.5,3);
  camera.lookAt(0,0.5,0);
  var renderer=new THREE.WebGLRenderer({antialias:true});
  renderer.setSize(W,H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
  document.body.appendChild(renderer.domElement);

  var aLight=new THREE.AmbientLight(0xffffff,0.6);
  scene.add(aLight);
  var dLight=new THREE.DirectionalLight(0xffffff,0.8);
  dLight.position.set(3,5,4);
  scene.add(dLight);

  var mat=new THREE.MeshLambertMaterial({color:'${primary}'});
  var mat2=new THREE.MeshLambertMaterial({color:'${secondary}'});
  var edgeMat=new THREE.LineBasicMaterial({color:0x1A1A1A,linewidth:1});

  function box(w,h,d,m){
    var g=new THREE.BoxGeometry(w,h,d);
    var mesh=new THREE.Mesh(g,m||mat);
    var edges=new THREE.EdgesGeometry(g);
    var line=new THREE.LineSegments(edges,edgeMat);
    mesh.add(line);
    return mesh;
  }

  var dog=new THREE.Group();

  // Body
  var body=box(${bodyLength},${bodyHeight},${bodyHeight * 0.8},mat);
  body.position.y=${legLength + bodyHeight / 2};
  dog.add(body);

  // Head
  var head=box(${headSize},${headSize},${headSize * 0.9},mat);
  head.position.set(${bodyLength / 2 + headSize * 0.3},${legLength + bodyHeight + headSize * 0.1},0);
  dog.add(head);

  // Snout
  var snout=box(${snoutLength},${headSize * 0.35},${headSize * 0.4},mat2);
  snout.position.set(${bodyLength / 2 + headSize * 0.3 + headSize / 2 + snoutLength * 0.3},${legLength + bodyHeight - headSize * 0.05},0);
  dog.add(snout);

  // Nose
  var nose=box(0.08,0.08,0.08,new THREE.MeshLambertMaterial({color:0x1A1A1A}));
  nose.position.set(${bodyLength / 2 + headSize * 0.3 + headSize / 2 + snoutLength * 0.7},${legLength + bodyHeight + headSize * 0.05},0);
  dog.add(nose);

  // Eyes
  var eyeMat=new THREE.MeshLambertMaterial({color:0x1A1A1A});
  var eyeL=box(0.08,0.1,0.08,eyeMat);
  eyeL.position.set(${bodyLength / 2 + headSize * 0.55},${legLength + bodyHeight + headSize * 0.2},${headSize * 0.25});
  dog.add(eyeL);
  var eyeR=box(0.08,0.1,0.08,eyeMat);
  eyeR.position.set(${bodyLength / 2 + headSize * 0.55},${legLength + bodyHeight + headSize * 0.2},-${headSize * 0.25});
  dog.add(eyeR);

  // Ears
  ${earType === 'pointy' ? `
  var earL=box(${headSize * 0.2},${headSize * 0.4},${headSize * 0.15},mat2);
  earL.position.set(${bodyLength / 2 + headSize * 0.15},${legLength + bodyHeight + headSize * 0.65},${headSize * 0.3});
  earL.rotation.z=0.3;
  dog.add(earL);
  var earR=box(${headSize * 0.2},${headSize * 0.4},${headSize * 0.15},mat2);
  earR.position.set(${bodyLength / 2 + headSize * 0.15},${legLength + bodyHeight + headSize * 0.65},-${headSize * 0.3});
  earR.rotation.z=0.3;
  dog.add(earR);
  ` : `
  var earL=box(${headSize * 0.25},${headSize * 0.35},${headSize * 0.15},mat2);
  earL.position.set(${bodyLength / 2 + headSize * 0.1},${legLength + bodyHeight + headSize * 0.15},${headSize * 0.38});
  earL.rotation.z=-0.4;earL.rotation.x=0.2;
  dog.add(earL);
  var earR=box(${headSize * 0.25},${headSize * 0.35},${headSize * 0.15},mat2);
  earR.position.set(${bodyLength / 2 + headSize * 0.1},${legLength + bodyHeight + headSize * 0.15},-${headSize * 0.38});
  earR.rotation.z=-0.4;earR.rotation.x=-0.2;
  dog.add(earR);
  `}

  // Legs
  var legW=${Math.min(bodyHeight * 0.25, 0.18)};
  var legPivots=[];
  var legPositions=[
    [${bodyLength * 0.35},0,${bodyHeight * 0.3}],
    [${bodyLength * 0.35},0,-${bodyHeight * 0.3}],
    [-${bodyLength * 0.35},0,${bodyHeight * 0.3}],
    [-${bodyLength * 0.35},0,-${bodyHeight * 0.3}]
  ];
  for(var i=0;i<4;i++){
    var pivot=new THREE.Group();
    pivot.position.set(legPositions[i][0],${legLength + bodyHeight * 0.05},legPositions[i][2]);
    var leg=box(legW,${legLength},legW,mat);
    leg.position.y=-${legLength / 2};
    pivot.add(leg);
    dog.add(pivot);
    legPivots.push(pivot);
  }

  // Tail
  ${tailType === 'short' ? `
  var tailPivot=new THREE.Group();
  tailPivot.position.set(-${bodyLength / 2},${legLength + bodyHeight * 0.8},0);
  var tail=box(0.15,0.12,0.12,mat2);
  tail.position.x=-0.1;
  tailPivot.add(tail);
  dog.add(tailPivot);
  ` : tailType === 'curly' ? `
  var tailPivot=new THREE.Group();
  tailPivot.position.set(-${bodyLength / 2},${legLength + bodyHeight * 0.85},0);
  var tail=box(0.12,0.25,0.12,mat2);
  tail.position.set(-0.05,0.15,0);
  tail.rotation.z=0.8;
  tailPivot.add(tail);
  dog.add(tailPivot);
  ` : `
  var tailPivot=new THREE.Group();
  tailPivot.position.set(-${bodyLength / 2},${legLength + bodyHeight * 0.8},0);
  var tail=box(0.12,${bodyHeight * 0.6},0.12,mat2);
  tail.position.set(-0.08,${bodyHeight * 0.25},0);
  tail.rotation.z=0.6;
  tailPivot.add(tail);
  dog.add(tailPivot);
  `}

  dog.position.y=-0.3;
  scene.add(dog);

  // Ground plane
  var groundGeo=new THREE.BoxGeometry(8,0.08,8);
  var groundMat=new THREE.MeshLambertMaterial({color:0xFFF3C4});
  var ground=new THREE.Mesh(groundGeo,groundMat);
  var groundEdges=new THREE.LineSegments(new THREE.EdgesGeometry(groundGeo),edgeMat);
  ground.add(groundEdges);
  ground.position.y=-0.35;
  scene.add(ground);

  var clock=new THREE.Clock();
  function animate(){
    requestAnimationFrame(animate);
    var t=clock.getElapsedTime()*3.5;

    // Walk cycle
    var swing=0.35;
    legPivots[0].rotation.x=Math.sin(t)*swing;
    legPivots[1].rotation.x=-Math.sin(t)*swing;
    legPivots[2].rotation.x=-Math.sin(t)*swing;
    legPivots[3].rotation.x=Math.sin(t)*swing;

    // Body bounce
    body.position.y=${legLength + bodyHeight / 2}+Math.abs(Math.sin(t*2))*0.04;

    // Head bob
    head.rotation.z=Math.sin(t*0.7)*0.05;
    head.position.y=${legLength + bodyHeight + headSize * 0.1}+Math.sin(t*2)*0.02;

    // Tail wag
    tailPivot.rotation.y=Math.sin(t*4)*0.5;

    // Slow rotate for 3/4 view
    dog.rotation.y=Math.sin(t*0.15)*0.3+0.4;

    renderer.render(scene,camera);
  }
  animate();

  window.addEventListener('resize',function(){
    W=window.innerWidth;H=window.innerHeight;
    camera.aspect=W/H;camera.updateProjectionMatrix();
    renderer.setSize(W,H);
  });
})();
</script></body></html>`
}
