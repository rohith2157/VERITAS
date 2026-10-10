const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const outDir = 'C:\\TTProject\\audit_screenshots';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const cdpPort = 9850;
const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--window-size=1440,1100',
  '--remote-debugging-port=' + cdpPort,
  'http://localhost:5173/#studio'
]);

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function run() {
  console.log('[E2E Studio] Waiting for Chrome to bind port', cdpPort);
  await sleep(2500);

  let target = null;
  for (let i = 0; i < 15; i++) {
    try {
      const res = await fetch(`http://localhost:${cdpPort}/json`);
      const tabs = await res.json();
      target = tabs.find(t => t.url.includes('5173') || t.url.includes('studio'));
      if (target) break;
    } catch (e) {
      // retry
    }
    await sleep(500);
  }

  if (!target) {
    chrome.kill();
    throw new Error('Target tab with port 5173 not found in Chrome');
  }

  console.log('[E2E Studio] Connecting via WebSocket to', target.webSocketDebuggerUrl);
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener('open', r));

  let msgId = 1;
  const pending = new Map();
  ws.addEventListener('message', (ev) => {
    const data = JSON.parse(ev.data);
    if (data.id && pending.has(data.id)) {
      const resolve = pending.get(data.id);
      pending.delete(data.id);
      resolve(data.result);
    }
  });

  const send = (method, params = {}) => {
    return new Promise((resolve) => {
      const id = ++msgId;
      pending.set(id, resolve);
      ws.send(JSON.stringify({ id, method, params }));
    });
  };

  await send('Page.enable');
  await send('Runtime.enable');
  await send('DOM.enable');

  const evalJs = async (expression) => {
    const res = await send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    return res?.result?.value;
  };

  const captureScreenshot = async (filepath) => {
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(filepath, Buffer.from(shot.data, 'base64'));
    console.log('[E2E Studio] Saved screenshot:', filepath);
  };

  console.log('[E2E Studio] Waiting for Studio UI to initialize...');
  await sleep(1000);

  // Navigate explicitly to #studio if not there and wait for mount
  let studioLoaded = false;
  for (let i = 0; i < 20; i++) {
    const hasStudio = await evalJs("!!document.getElementById('tab-btn-1to1')");
    if (hasStudio) { studioLoaded = true; break; }
    await evalJs("window.location.hash = 'studio'");
    await evalJs("document.querySelector('a[href=\"#studio\"], [data-tab=\"studio\"], button:has-text(\"Studio\")')?.click()");
    await sleep(500);
  }
  console.log('[E2E Studio] Studio mounted in DOM:', studioLoaded);
  await sleep(1000);

  const testReport = {
    timestamp: new Date().toISOString(),
    tests: []
  };

  // ==================== TEST 1: SUB-TAB 1: 1-TO-1 SPLIT DIFF ====================
  console.log('[E2E Studio] Auditing Sub-Tab 1: 1-to-1 Split Diff...');
  await evalJs("document.getElementById('tab-btn-1to1')?.click()");
  await sleep(600);
  await evalJs("document.getElementById('btn-execute-1to1')?.click()");
  await sleep(1500);

  const tab1Score = await evalJs("document.getElementById('diff-similarity-score')?.innerText");
  const leftPaneExists = await evalJs("!!document.getElementById('diff-pane-left')");
  const rightPaneExists = await evalJs("!!document.getElementById('diff-pane-right')");
  const lineCount = await evalJs("document.querySelectorAll('#diff-pane-left > div').length");

  console.log(`[E2E Studio] Tab 1 Score: ${tab1Score}, Dual Panes: ${leftPaneExists && rightPaneExists}, Aligned Lines: ${lineCount}`);
  testReport.tests.push({
    test: "Sub-Tab 1: 1-to-1 Split Diff Baseline",
    similarity_score: tab1Score,
    dual_panes_verified: leftPaneExists && rightPaneExists,
    aligned_lines_count: lineCount,
    passed: Boolean(tab1Score && leftPaneExists && rightPaneExists && lineCount > 0)
  });

  await captureScreenshot(path.join(outDir, 'studio_tab1_split_diff.png'));

  // Test Homoglyph Evasion Attack in Tab 1
  console.log('[E2E Studio] Testing Adversarial Homoglyph Evasion Attack...');
  await evalJs("document.getElementById('btn-preset-homoglyph')?.click()");
  await sleep(600);
  await evalJs("document.getElementById('btn-execute-1to1')?.click()");
  await sleep(1500);

  const homoglyphAlertExists = await evalJs("!!document.getElementById('homoglyph-evasion-alert')");
  const homoglyphCharsCount = await evalJs("document.querySelectorAll('.homoglyph-char').length");
  console.log(`[E2E Studio] Homoglyph Alert Detected: ${homoglyphAlertExists}, Homoglyph Inline Badges: ${homoglyphCharsCount}`);

  testReport.tests.push({
    test: "Sub-Tab 1: Homoglyph Evasion Highlighting & Defense",
    alert_banner_rendered: homoglyphAlertExists,
    highlighted_homoglyphs_count: homoglyphCharsCount,
    passed: Boolean(homoglyphAlertExists && homoglyphCharsCount > 0)
  });

  await captureScreenshot(path.join(outDir, 'studio_tab1_homoglyph_evasion.png'));

  // ==================== TEST 2: SUB-TAB 2: COHORT N×N MATRIX ====================
  console.log('[E2E Studio] Auditing Sub-Tab 2: Cohort N×N Matrix...');
  await evalJs("document.getElementById('tab-btn-matrix')?.click()");
  await sleep(800);
  await evalJs("document.getElementById('btn-run-matrix')?.click()");
  await sleep(1500);

  const matrixTableExists = await evalJs("!!document.getElementById('cohort-matrix-table')");
  const collusionRingCard = await evalJs("!!document.getElementById('collusion-ring-card')");
  const patientZeroText = await evalJs("document.getElementById('collusion-ring-card')?.innerText");

  // Click cell to test drawer
  await evalJs("document.querySelectorAll('#cohort-matrix-table td')[1]?.click()");
  await sleep(600);

  console.log(`[E2E Studio] Matrix Table: ${matrixTableExists}, Collusion Ring: ${collusionRingCard}, Patient Zero: ${patientZeroText ? 'Found' : 'Missing'}`);
  testReport.tests.push({
    test: "Sub-Tab 2: Cohort N×N Matrix & Patient Zero Discovery",
    matrix_table_rendered: matrixTableExists,
    collusion_ring_detected: collusionRingCard,
    patient_zero_attributed: Boolean(patientZeroText && patientZeroText.includes('Arjun Patel')),
    passed: Boolean(matrixTableExists && collusionRingCard)
  });

  await captureScreenshot(path.join(outDir, 'studio_tab2_cohort_matrix.png'));

  // ==================== TEST 3: SUB-TAB 3: AI FORENSICS ====================
  console.log('[E2E Studio] Auditing Sub-Tab 3: AI Writing Forensics...');
  await evalJs("document.getElementById('tab-btn-ai')?.click()");
  await sleep(800);
  await evalJs("document.getElementById('btn-run-ai-forensics')?.click()");
  await sleep(1500);

  const aiProb = await evalJs("document.getElementById('ai-probability-score')?.innerText");
  const aiBurstiness = await evalJs("document.getElementById('ai-burstiness-score')?.innerText");
  const aiPerplexity = await evalJs("document.getElementById('ai-perplexity-score')?.innerText");

  console.log(`[E2E Studio] AI Probability: ${aiProb}, Burstiness: ${aiBurstiness}, Perplexity: ${aiPerplexity}`);
  testReport.tests.push({
    test: "Sub-Tab 3: AI Writing Forensics (Perplexity & Burstiness)",
    ai_probability_score: aiProb,
    burstiness_score: aiBurstiness,
    perplexity_score: aiPerplexity,
    passed: Boolean(aiProb && aiBurstiness && aiPerplexity)
  });

  await captureScreenshot(path.join(outDir, 'studio_tab3_ai_forensics.png'));

  // ==================== TEST 4: SUB-TAB 4: CODE AST CLONE ====================
  console.log('[E2E Studio] Auditing Sub-Tab 4: Code AST Clone Inspector...');
  await evalJs("document.getElementById('tab-btn-code')?.click()");
  await sleep(800);
  await evalJs("document.getElementById('btn-run-code-ast')?.click()");
  await sleep(1500);

  const astEquiv = await evalJs("document.getElementById('ast-equivalence-percentage')?.innerText");
  const mappingTableExists = await evalJs("!!document.getElementById('ast-variable-mapping-table')");
  const mappingRowsCount = await evalJs("document.querySelectorAll('#ast-variable-mapping-table tbody tr').length");
  const normalizedAstOutput = await evalJs("document.getElementById('normalized-ast-output')?.innerText");

  console.log(`[E2E Studio] AST Equivalence: ${astEquiv}, Variable Mappings: ${mappingRowsCount} rows, Canonical AST: ${Boolean(normalizedAstOutput)}`);
  testReport.tests.push({
    test: "Sub-Tab 4: Code AST Clone Inspector & Variable Mappings",
    ast_structural_equivalence: astEquiv,
    variable_mappings_table_rendered: mappingTableExists,
    variable_mappings_rows: mappingRowsCount,
    canonical_ast_rendered: Boolean(normalizedAstOutput),
    passed: Boolean(astEquiv && mappingTableExists && mappingRowsCount >= 4)
  });

  await captureScreenshot(path.join(outDir, 'studio_tab4_code_ast_clone.png'));

  // Write summary report
  const reportPath = path.join(outDir, 'studio_verification_report.json');
  fs.writeFileSync(reportPath, JSON.stringify(testReport, null, 2));
  console.log('[E2E Studio] Verification test suite complete! Results written to:', reportPath);

  chrome.kill();
  ws.close();
}

run().catch(err => {
  console.error('[E2E Studio] ERROR:', err);
  chrome.kill();
  process.exit(1);
});
