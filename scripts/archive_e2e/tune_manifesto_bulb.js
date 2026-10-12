const fs = require('fs');
let code = fs.readFileSync('c:/TTProject/frontend/public/scripts/theme.js', 'utf8');

// Let's adjust _updateRotation and _updatePosition so the lightbulb forms at Manifesto section (e: 1.8 - 2.2)
// Original _updateRotation:
// t=zt(Ut(e,0,1,0,.5*-Math.PI),.5*-Math.PI,0)+zt(Ut(e,2.7,3,0,.5*Math.PI),0,.5*Math.PI)+zt(Ut(e,3.3,3.5,0,.25*Math.PI),0,.25*Math.PI)-zt(Ut(e,4.5,5,0,1.25*Math.PI),0,1.25*Math.PI)+zt(Ut(e,5.7,this.royYEnd,0,Math.PI),0,Math.PI),
// n=zt(Ut(e,2.7,3,0,-.489),-.489,0)+zt(Ut(e,3.3,3.5,0,.6),0,.6)

// Let's replace 2.7,3 with 1.8,2.2 in rotation and in u_progress
const oldRot = 't=zt(Ut(e,0,1,0,.5*-Math.PI),.5*-Math.PI,0)+zt(Ut(e,2.7,3,0,.5*Math.PI),0,.5*Math.PI)+zt(Ut(e,3.3,3.5,0,.25*Math.PI),0,.25*Math.PI)';
const newRot = 't=zt(Ut(e,0,1,0,.5*-Math.PI),.5*-Math.PI,0)+zt(Ut(e,1.8,2.2,0,.5*Math.PI),0,.5*Math.PI)+zt(Ut(e,3.3,3.5,0,.25*Math.PI),0,.25*Math.PI)';

const oldRotZ = 'n=zt(Ut(e,2.7,3,0,-.489),-.489,0)+zt(Ut(e,3.3,3.5,0,.6),0,.6)';
const newRotZ = 'n=zt(Ut(e,1.8,2.2,0,-.489),-.489,0)+zt(Ut(e,3.3,3.5,0,.6),0,.6)';

// In _updatePosition:
// const o=zt(Ut(e,2.7,3,0,1),0,1)+zt(Ut(e,3.3,3.5,0,1),0,1)+zt(Ut(e,5.7,6,0,1),0,1)
const oldProgress = 'const o=zt(Ut(e,2.7,3,0,1),0,1)+zt(Ut(e,3.3,3.5,0,1),0,1)+zt(Ut(e,5.7,6,0,1),0,1)';
const newProgress = 'const o=zt(Ut(e,1.8,2.2,0,1),0,1)+zt(Ut(e,3.3,3.5,0,1),0,1)+zt(Ut(e,5.7,6,0,1),0,1)';

// In u_explode:
// const i=zt(Ut(e,1.1,2.2,0,1),0,1)-zt(Ut(e,2.8,3,0,1),0,1)+zt(Ut(e,4.5,5,0,1),0,1)-zt(Ut(e,5.7,6,0,1),0,1)
// We explode between 2.3 and 2.7 (during "chaos leaves your team feeling overwhelmed") and subside at 2.8!
const oldExplode = 'const i=zt(Ut(e,1.1,2.2,0,1),0,1)-zt(Ut(e,2.8,3,0,1),0,1)+zt(Ut(e,4.5,5,0,1),0,1)-zt(Ut(e,5.7,6,0,1),0,1)';
const newExplode = 'const i=zt(Ut(e,2.3,2.5,0,1),0,1)-zt(Ut(e,2.8,3,0,1),0,1)+zt(Ut(e,4.5,5,0,1),0,1)-zt(Ut(e,5.7,6,0,1),0,1)';

// Also position X:
// At e: 1.8 to 2.2, center the bulb (x = -0.5)
const oldPosX = 't=zt(Ut(e,0,1,3,-4.5),-4.5,3)+zt(Ut(e,1.25,1.5,.905,5),.905,5)-zt(Ut(e,2.8,3,.905,3),.905,3)';
const newPosX = 't=zt(Ut(e,0,1,3,-4.5),-4.5,3)+zt(Ut(e,1.25,1.5,.905,5),.905,5)-zt(Ut(e,1.8,2.2,0,0.5),0,0.5)-zt(Ut(e,2.8,3,.905,3),.905,3)';

console.log('Includes oldRot:', code.includes(oldRot));
console.log('Includes oldRotZ:', code.includes(oldRotZ));
console.log('Includes oldProgress:', code.includes(oldProgress));
console.log('Includes oldExplode:', code.includes(oldExplode));
console.log('Includes oldPosX:', code.includes(oldPosX));

if (code.includes(oldRot)) code = code.replace(oldRot, newRot);
if (code.includes(oldRotZ)) code = code.replace(oldRotZ, newRotZ);
if (code.includes(oldProgress)) code = code.replace(oldProgress, newProgress);
if (code.includes(oldExplode)) code = code.replace(oldExplode, newExplode);
if (code.includes(oldPosX)) code = code.replace(oldPosX, newPosX);

fs.writeFileSync('c:/TTProject/frontend/public/scripts/theme.js', code);
console.log('Successfully calibrated theme.js for Manifesto Lightbulb morph!');

