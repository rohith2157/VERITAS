const fs = require('fs');
const path = require('path');

function patchTheme(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log('Skipping missing file:', filePath);
    return;
  }
  let code = fs.readFileSync(filePath, 'utf8');
  let originalLen = code.length;

  // 1. Prevent wheel interception (remove e.preventDefault())
  const t1 = 'else e.preventDefault(),this.syncScroll=!0,this.targetPos+=-1*e.deltaY;';
  const r1 = 'else void 0,this.syncScroll=!0,this.targetPos+=-1*e.deltaY;';
  if (code.includes(t1)) {
    code = code.replace(t1, r1);
    console.log(filePath, ': Patched t1 (preventDefault removed)');
  }

  // 2. Prevent mousemove from resetting isTouch to false
  const t2 = 'detectMouse(){window.addEventListener("mousemove",(function e(t){(Math.abs(t.movementX)>0||Math.abs(t.movementY)>0)&&(o().isTouch=!1,E.emit(C.MOUSEDETECTED),window.removeEventListener("mousemove",e))}))}';
  const r2 = 'detectMouse(){}';
  if (code.includes(t2)) {
    code = code.replace(t2, r2);
    console.log(filePath, ': Patched t2 (detectMouse neutralized)');
  }

  // 3. Make ASScroll initialize with isTouch = true
  const t3 = '"ontouchstart"in document.documentElement&&(o().isTouch=!0,this.detectMouse())}';
  const r3 = 'o().isTouch=!0;}';
  if (code.includes(t3)) {
    code = code.replace(t3, r3);
    console.log(filePath, ': Patched t3 (isTouch permanently enabled)');
  }

  // 4. Neutralize fixed position lockup in setupSmoothScroll
  const t4 = 'Object.assign(this.containerElement.style,{position:"fixed",top:"0px",left:"0px",width:"100%",height:"100%",contain:"content"})';
  const r4 = 'Object.assign(this.containerElement.style,{position:"static",top:"0px",left:"0px",width:"100%",height:"auto",contain:"none"})';
  if (code.includes(t4)) {
    code = code.replace(t4, r4);
    console.log(filePath, ': Patched t4 (containerElement fixed lock removed)');
  }

  // 5. Cap WebGL pixel ratio to 1.0 for high FPS on all screens
  const t5 = 'this.renderer.setPixelRatio(e),this.renderer.setSize(u.window.w,u.window.h)';
  const r5 = 'this.renderer.setPixelRatio(Math.min(e,1.0)),this.renderer.setSize(u.window.w,u.window.h)';
  if (code.includes(t5)) {
    code = code.replace(t5, r5);
    console.log(filePath, ': Patched t5 (renderer pixel ratio capped to 1.0)');
  }

  // 6. Instant site loader resolution (instant entry, zero load freeze)
  const t6 = '(this.skip||"/"!==window.location.pathname)&&this.revealedResolve()';
  const r6 = 'this.revealedResolve()';
  if (code.includes(t6)) {
    code = code.replace(t6, r6);
    console.log(filePath, ': Patched t6 (siteLoader revealedResolve executed instantly)');
  }

  // 7. Auto hide loader immediately
  const t7 = 'this.skip||"/"!==window.location.pathname?A.ZP.set(this.dom.el,{autoAlpha:0,pointerEvents:"none"}):this.build()';
  const r7 = 'A.ZP.set(this.dom.el,{autoAlpha:0,pointerEvents:"none",display:"none"})';
  if (code.includes(t7)) {
    code = code.replace(t7, r7);
    console.log(filePath, ': Patched t7 (loader element auto-hidden)');
  }

  fs.writeFileSync(filePath, code, 'utf8');
  console.log(filePath, ': Done. Length before:', originalLen, 'after:', code.length);
}

patchTheme(path.join(__dirname, '../frontend/public/scripts/theme.js'));
patchTheme(path.join(__dirname, '../frontend/dist/scripts/theme.js'));
patchTheme(path.join(__dirname, '../frontend/src/veritas-assets/theme.js'));
