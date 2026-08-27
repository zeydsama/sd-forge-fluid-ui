/**
 * Fluid Forge UI Controller
 * Handles Theme Management, UI Bone Layout Modes (Legacy & Codex v1 Cockpit),
 * and High-Performance Mobile Drawers.
 */

(function () {
    
    // --- 1. THEME INITIALIZATION (Native Fluid vs Studio Pro Max vs Pure Gradio) ---
    const initTheme = () => {
        let theme = 'Native Fluid';
        if (typeof opts !== 'undefined' && opts.fluid_ui_theme) {
            theme = opts.fluid_ui_theme;
        }

        const targets = [document.documentElement, document.body];
        const gApp = document.querySelector('gradio-app') || document.querySelector('#gradio-app');
        if (gApp) targets.push(gApp);

        targets.forEach(el => {
            if (!el) return;
            el.classList.remove('fluid-theme-codex', 'fluid-theme-pro-max', 'fluid-theme-pure-gradio');
            if (theme === 'Pure Gradio') {
                el.classList.add('fluid-theme-pure-gradio');
            } else if (theme === 'Studio Pro Max') {
                el.classList.add('fluid-theme-pro-max');
            } else {
                el.classList.add('fluid-theme-codex');
            }
        });
    };

    // Helper: Safely update Gradio Slider/Number value
    const setGradioSlider = (container, val) => {
        if (!container) return;
        const numInput = container.querySelector('input[type="number"]');
        const rangeInput = container.querySelector('input[type="range"]');
        if (numInput) {
            numInput.value = val;
            numInput.dispatchEvent(new Event('input', { bubbles: true }));
            numInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
        if (rangeInput) {
            rangeInput.value = val;
            rangeInput.dispatchEvent(new Event('input', { bubbles: true }));
            rangeInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
    };

    const getGradioVal = (container) => {
        if (!container) return 1024;
        const input = container.querySelector('input[type="number"]') || container.querySelector('input[type="range"]');
        return input ? parseFloat(input.value) || 1024 : 1024;
    };

    // --- 2. CODEX V1 GENERATION COCKPIT BONE ---
    const initCodexCockpit = () => {
        document.body.classList.remove('fluid-bone-legacy');
        document.body.classList.add('fluid-bone-codex-v1');

        const tabs = ['txt2img', 'img2img'];

        tabs.forEach(tab => {
            const settingsCol = document.querySelector(`#${tab}_settings`);
            if (!settingsCol) return;

            // Build Bento Grid Container if not present
            let cockpitGrid = settingsCol.querySelector(`.fluid-cockpit-grid#${tab}_cockpit_grid`);
            if (!cockpitGrid) {
                cockpitGrid = document.createElement('div');
                cockpitGrid.className = 'fluid-cockpit-grid';
                cockpitGrid.id = `${tab}_cockpit_grid`;

                // Build Bento Cards
                const cardSampling = document.createElement('div');
                cardSampling.className = 'fluid-bento-card card-sampling';
                cardSampling.innerHTML = '<div class="fluid-bento-title">1. Sampling & Guidance</div><div class="fluid-bento-content"></div>';

                const cardFraming = document.createElement('div');
                cardFraming.className = 'fluid-bento-card card-framing';
                cardFraming.innerHTML = '<div class="fluid-bento-title">2. Framing & Resolution</div><div class="fluid-bento-content"></div>';

                const cardSeed = document.createElement('div');
                cardSeed.className = 'fluid-bento-card card-seed';
                cardSeed.innerHTML = '<div class="fluid-bento-title">3. Seed</div><div class="fluid-bento-content"></div>';

                cockpitGrid.appendChild(cardSampling);
                cockpitGrid.appendChild(cardFraming);
                cockpitGrid.appendChild(cardSeed);

                // Insert at top of settings
                settingsCol.insertBefore(cockpitGrid, settingsCol.firstChild);
            }

            const cardSeedEl = cockpitGrid.querySelector('.card-seed');
            if (cardSeedEl) {
                cardSeedEl.style.display = '';
                cockpitGrid.style.gridTemplateColumns = '';
            }

            const samplingContent = cockpitGrid.querySelector('.card-sampling .fluid-bento-content');
            const framingContent = cockpitGrid.querySelector('.card-framing .fluid-bento-content');
            const seedContent = cockpitGrid.querySelector('.card-seed .fluid-bento-content');

            // --- MOVE SAMPLING CONTROLS INTO CARD 1 ---
            const samplingDropdown = document.querySelector(`#${tab}_sampling`);
            const schedulerDropdown = document.querySelector(`#${tab}_scheduler`);
            const stepsSlider = document.querySelector(`#${tab}_steps`);
            const cfgSlider = document.querySelector(`#${tab}_cfg_scale`);
            const distilledCfgSlider = document.querySelector(`#${tab}_distilled_cfg_scale`);

            if (samplingDropdown && samplingDropdown.parentNode !== samplingContent) {
                let dropRow = samplingContent.querySelector('.fluid-sampling-drop-row');
                if (!dropRow) {
                    dropRow = document.createElement('div');
                    dropRow.className = 'fluid-sampling-drop-row';
                    samplingContent.appendChild(dropRow);
                }
                dropRow.appendChild(samplingDropdown);
                if (schedulerDropdown) dropRow.appendChild(schedulerDropdown);
            }

            if (stepsSlider && stepsSlider.parentNode !== samplingContent) {
                samplingContent.appendChild(stepsSlider);
            }
            if (distilledCfgSlider && distilledCfgSlider.parentNode !== samplingContent) {
                samplingContent.appendChild(distilledCfgSlider);
            }
            if (cfgSlider && cfgSlider.parentNode !== samplingContent) {
                samplingContent.appendChild(cfgSlider);
            }

            // --- BUILD & MOVE FRAMING CONTROLS INTO CARD 2 ---
            const widthCol = document.querySelector(`#${tab}_width`);
            const heightCol = document.querySelector(`#${tab}_height`);
            const switchBtn = document.querySelector(`#${tab}_res_switch_btn`);

            let aspectBar = framingContent.querySelector(`#${tab}_aspect_cockpit`);
            if (!aspectBar) {
                aspectBar = document.createElement('div');
                aspectBar.className = 'fluid-cockpit-aspect-bar';
                aspectBar.id = `${tab}_aspect_cockpit`;
                aspectBar.innerHTML = `
                    <div class="fluid-aspect-header">
                        <div class="fluid-aspect-pills">
                            <button type="button" class="fluid-ratio-pill active" data-ratio="1:1" title="1:1 Square">1:1</button>
                            <button type="button" class="fluid-ratio-pill" data-ratio="4:5" title="4:5 Portrait">4:5</button>
                            <button type="button" class="fluid-ratio-pill" data-ratio="3:2" title="3:2 Landscape">3:2</button>
                            <button type="button" class="fluid-ratio-pill" data-ratio="2:3" title="2:3 Portrait">2:3</button>
                            <button type="button" class="fluid-ratio-pill" data-ratio="16:9" title="16:9 Cinema">16:9</button>
                            <button type="button" class="fluid-ratio-pill" data-ratio="9:16" title="9:16 Story">9:16</button>
                        </div>
                        <div class="fluid-aspect-meta">
                            <div class="fluid-base-picker">
                                <span class="fluid-base-tag">Base:</span>
                                <button type="button" class="fluid-base-pill" data-base="1536">1536</button>
                                <button type="button" class="fluid-base-pill" data-base="1280">1280</button>
                                <button type="button" class="fluid-base-pill active" data-base="1024">1024</button>
                                <button type="button" class="fluid-base-pill" data-base="768">768</button>
                                <button type="button" class="fluid-base-pill" data-base="512">512</button>
                            </div>
                            <button type="button" class="fluid-aspect-lock" title="Lock aspect ratio" data-locked="false">🔓</button>
                        </div>
                    </div>
                `;
                framingContent.appendChild(aspectBar);
            }

            let dimRow = framingContent.querySelector('.fluid-dim-sliders-row');
            if (!dimRow) {
                dimRow = document.createElement('div');
                dimRow.className = 'fluid-dim-sliders-row';
                framingContent.appendChild(dimRow);
            }
            if (widthCol && widthCol.parentNode !== dimRow) dimRow.appendChild(widthCol);
            if (switchBtn && switchBtn.parentNode !== dimRow) dimRow.appendChild(switchBtn);
            if (heightCol && heightCol.parentNode !== dimRow) dimRow.appendChild(heightCol);

            const resizeTabs = document.querySelector(`#${tab}_tabs_resize`);
            if (resizeTabs && resizeTabs.parentNode !== framingContent) {
                framingContent.appendChild(resizeTabs);
            }

            let resBadge = framingContent.querySelector(`#${tab}_res_badge`);
            if (!resBadge) {
                resBadge = document.createElement('div');
                resBadge.className = 'fluid-res-badge';
                resBadge.id = `${tab}_res_badge`;
                resBadge.innerHTML = `<span class="fluid-res-dim">1024 × 1024</span> • <span class="fluid-res-mp">1.05 MP</span> • <span class="fluid-res-vram">~4.2 GB VRAM</span>`;
                framingContent.appendChild(resBadge);
            }

            // --- MOVE SEED CONTROLS INTO CARD 3 ---
            const seedRow = document.querySelector(`#${tab}_seed_row`);
            const seedExtras = document.querySelector(`#${tab}_seed_extras`);
            const batchCount = document.querySelector(`#${tab}_batch_count`);
            const batchSize = document.querySelector(`#${tab}_batch_size`);

            if (seedRow && seedRow.parentNode !== seedContent) {
                seedContent.appendChild(seedRow);
            }
            if (seedExtras && seedExtras.parentNode !== seedContent) {
                seedContent.appendChild(seedExtras);
            }
            if (batchCount) {
                batchCount.style.display = 'none';
            }
            if (batchSize) {
                batchSize.style.display = 'none';
            }

            // --- ASPECT RATIO CALCULATOR ---
            let currentBase = 1024;
            let isLocked = false;
            let lockedRatio = 1.0;

            const updateResBadge = (w, h) => {
                if (!resBadge) return;
                const mp = ((w * h) / 1000000).toFixed(2);
                const estVram = (1.5 + (w * h * 2.8) / 1000000).toFixed(1);
                resBadge.innerHTML = `<span class="fluid-res-dim">${w} × ${h}</span> • <span class="fluid-res-mp">${mp} MP</span> • <span class="fluid-res-vram">~${estVram} GB VRAM</span>`;
            };

            const syncActiveRatio = (w, h) => {
                const r = (w / h).toFixed(2);
                aspectBar.querySelectorAll('.fluid-ratio-pill').forEach(btn => {
                    const targetRatio = btn.dataset.ratio;
                    let match = false;
                    if (targetRatio === '1:1' && Math.abs(r - 1.00) < 0.05) match = true;
                    if (targetRatio === '4:5' && Math.abs(r - 0.80) < 0.05) match = true;
                    if (targetRatio === '3:2' && Math.abs(r - 1.50) < 0.08) match = true;
                    if (targetRatio === '2:3' && Math.abs(r - 0.67) < 0.05) match = true;
                    if (targetRatio === '16:9' && Math.abs(r - 1.78) < 0.08) match = true;
                    if (targetRatio === '9:16' && Math.abs(r - 0.56) < 0.05) match = true;
                    btn.classList.toggle('active', match);
                });
            };

            aspectBar.querySelectorAll('.fluid-base-pill').forEach(btn => {
                btn.onclick = (e) => {
                    e.preventDefault();
                    aspectBar.querySelectorAll('.fluid-base-pill').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    currentBase = parseInt(btn.dataset.base, 10);
                    const activeRatioBtn = aspectBar.querySelector('.fluid-ratio-pill.active') || aspectBar.querySelector('[data-ratio="1:1"]');
                    if (activeRatioBtn) activeRatioBtn.click();
                };
            });

            const lockBtn = aspectBar.querySelector('.fluid-aspect-lock');
            if (lockBtn) {
                lockBtn.onclick = (e) => {
                    e.preventDefault();
                    isLocked = !isLocked;
                    lockBtn.dataset.locked = isLocked ? 'true' : 'false';
                    lockBtn.innerText = isLocked ? '🔒' : '🔓';
                    lockBtn.classList.toggle('active', isLocked);
                    if (isLocked) {
                        const curW = getGradioVal(widthCol);
                        const curH = getGradioVal(heightCol);
                        lockedRatio = (curH > 0) ? (curW / curH) : 1.0;
                    }
                };
            }

            const ratioFormulas = {
                '1:1': (b) => [b, b],
                '4:5': (b) => [Math.round((b * 0.875) / 16) * 16, Math.round((b * 1.09375) / 16) * 16],
                '3:2': (b) => [Math.round((b * 1.1875) / 16) * 16, Math.round((b * 0.8125) / 16) * 16],
                '2:3': (b) => [Math.round((b * 0.8125) / 16) * 16, Math.round((b * 1.1875) / 16) * 16],
                '16:9': (b) => [Math.round((b * 1.3125) / 16) * 16, Math.round((b * 0.75) / 16) * 16],
                '9:16': (b) => [Math.round((b * 0.75) / 16) * 16, Math.round((b * 1.3125) / 16) * 16]
            };

            aspectBar.querySelectorAll('.fluid-ratio-pill').forEach(btn => {
                btn.onclick = (e) => {
                    e.preventDefault();
                    aspectBar.querySelectorAll('.fluid-ratio-pill').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    
                    const calc = ratioFormulas[btn.dataset.ratio];
                    if (calc) {
                        const [targetW, targetH] = calc(currentBase);
                        setGradioSlider(widthCol, targetW);
                        setGradioSlider(heightCol, targetH);
                        updateResBadge(targetW, targetH);
                        if (isLocked) lockedRatio = targetW / targetH;
                    }
                };
            });

            const onDimensionChange = (changedDimension) => {
                const w = getGradioVal(widthCol);
                const h = getGradioVal(heightCol);

                if (isLocked && lockedRatio > 0) {
                    if (changedDimension === 'width') {
                        const newH = Math.round((w / lockedRatio) / 16) * 16;
                        setGradioSlider(heightCol, newH);
                    } else if (changedDimension === 'height') {
                        const newW = Math.round((h * lockedRatio) / 16) * 16;
                        setGradioSlider(widthCol, newW);
                    }
                }
                const curW = getGradioVal(widthCol);
                const curH = getGradioVal(heightCol);
                updateResBadge(curW, curH);
                syncActiveRatio(curW, curH);
            };

            if (widthCol && !widthCol.dataset.bound) {
                widthCol.dataset.bound = 'true';
                widthCol.addEventListener('input', () => onDimensionChange('width'));
            }
            if (heightCol && !heightCol.dataset.bound) {
                heightCol.dataset.bound = 'true';
                heightCol.addEventListener('input', () => onDimensionChange('height'));
            }

            updateResBadge(getGradioVal(widthCol), getGradioVal(heightCol));
            syncActiveRatio(getGradioVal(widthCol), getGradioVal(heightCol));

            // --- BATCH STEPPERS (- / +) ---
            [batchCount, batchSize].forEach(container => {
                if (container && !container.querySelector('.fluid-stepper-btn')) {
                    const numInput = container.querySelector('input[type="number"]');
                    if (numInput && numInput.parentNode) {
                        const minusBtn = document.createElement('button');
                        minusBtn.type = 'button';
                        minusBtn.className = 'fluid-stepper-btn minus';
                        minusBtn.innerText = '−';
                        minusBtn.title = 'Decrease';

                        const plusBtn = document.createElement('button');
                        plusBtn.type = 'button';
                        plusBtn.className = 'fluid-stepper-btn plus';
                        plusBtn.innerText = '+';
                        plusBtn.title = 'Increase';

                        minusBtn.onclick = (e) => {
                            e.preventDefault();
                            const current = parseInt(numInput.value, 10) || 1;
                            const min = parseInt(numInput.min, 10) || 1;
                            if (current > min) setGradioSlider(container, current - 1);
                        };

                        plusBtn.onclick = (e) => {
                            e.preventDefault();
                            const current = parseInt(numInput.value, 10) || 1;
                            const max = parseInt(numInput.max, 10) || 128;
                            if (current < max) setGradioSlider(container, current + 1);
                        };

                        numInput.parentNode.insertBefore(minusBtn, numInput);
                        numInput.parentNode.insertBefore(plusBtn, numInput.nextSibling);
                    }
                }
            });

            // --- 4. QUICK-DOCK CHIP STRIP (OPTION C: REFINED REAL-WORLD UX) ---
            const initAccordionDock = () => {
                const allRawAccordions = Array.from(settingsCol.querySelectorAll('.gradio-accordion, .gr-accordion, .input-accordion, details.accordion, details'));
                
                const allAccordions = allRawAccordions.filter(acc => {
                    // Exclude if inside bento cockpit grid
                    if (acc.closest('.fluid-cockpit-grid') || acc.closest('.fluid-bento-card')) return false;

                    // 1. EXCLUDE Segmented Prompt (Builder) - keep its native 1:1 behavior
                    if (acc.id && (acc.id.includes('segmented_prompt') || acc.id.includes('seg_sortable'))) return false;
                    const labelText = (acc.querySelector('.label-wrap, summary, .gr-accordion-title, span')?.textContent || '').toLowerCase();
                    if (labelText.includes('segmented prompt') || labelText.includes('prompt (builder)')) return false;

                    // Exclude if nested inside another accordion that is also inside settingsCol
                    let parent = acc.parentElement;
                    while (parent && parent !== settingsCol) {
                        if (parent.classList.contains('gradio-accordion') || 
                            parent.classList.contains('gr-accordion') || 
                            parent.classList.contains('input-accordion') || 
                            parent.tagName === 'DETAILS') {
                            return false; // It's an internal sub-accordion!
                        }
                        parent = parent.parentElement;
                    }
                    return true;
                });

                // Ensure Segmented Prompt has clean native styling
                settingsCol.querySelectorAll('[id*="segmented_prompt"]').forEach(el => {
                    el.classList.remove('fluid-docked-accordion');
                    el.style.display = '';
                });

                if (allAccordions.length === 0) return;

                let dock = settingsCol.querySelector(`.fluid-accordion-dock#${tab}_accordion_dock`);
                if (!dock) {
                    dock = document.createElement('div');
                    dock.className = 'fluid-accordion-dock';
                    dock.id = `${tab}_accordion_dock`;
                    dock.innerHTML = `
                        <div class="fluid-dock-header">
                            <span class="fluid-dock-title">Modules & Extensions</span>
                            <span class="fluid-dock-badge">${allAccordions.length} Modules</span>
                        </div>
                        <div class="fluid-dock-chips"></div>
                    `;
                    if (cockpitGrid && cockpitGrid.nextSibling) {
                        settingsCol.insertBefore(dock, cockpitGrid.nextSibling);
                    } else {
                        settingsCol.appendChild(dock);
                    }
                }

                const chipsContainer = dock.querySelector('.fluid-dock-chips');
                const badge = dock.querySelector('.fluid-dock-badge');
                if (badge) badge.innerText = `${allAccordions.length} Modules`;

                const checkIsOpen = (a) => {
                    if (!a) return false;
                    return a.classList.contains('fluid-drawer-open');
                };

                const closeAccordion = (a) => {
                    if (!a) return;
                    a.classList.remove('fluid-drawer-open');
                    a.style.display = 'none';
                    const pGroup = a.closest(`#${tab}_controlnet`);
                    if (pGroup) pGroup.style.display = 'none';
                };

                const openAccordion = (a) => {
                    if (!a) return;
                    a.classList.add('fluid-drawer-open');
                    a.style.display = 'block';
                    
                    // Ensure accordion interior is displayed cleanly
                    const inner = a.querySelector(':scope > div:not(.label-wrap)');
                    if (inner) {
                        inner.style.display = 'block';
                    }
                    
                    const pGroup = a.closest('#' + tab + '_controlnet');
                    if (pGroup) pGroup.style.display = 'block';
                    
                    // Ensure internal dropdown value is in sync with selected state
                    if (a._fluidController && a._fluidController.dropdown) {
                        const dd = a._fluidController.dropdown;
                        if (dd.dataset.selectedVal && a._fluidController.setVal) {
                            a._fluidController.setVal(dd.dataset.selectedVal);
                            setTimeout(() => {
                                if (a._fluidController && a._fluidController.setVal && dd.dataset.selectedVal) {
                                    a._fluidController.setVal(dd.dataset.selectedVal);
                                }
                            }, 40);
                        }
                    }
                };

                // Smart Accordion Adapter: Senses and controls enable state across all accordion types
                const getAccordionController = (acc) => {
                    // 1. InputAccordion / Header Checkbox (Spectrum, Hires fix, Radial, Soft Inpainting, etc.)
                    const headerCb = acc.querySelector('.input-accordion-checkbox, :scope > .label-wrap input[type="checkbox"], :scope > summary input[type="checkbox"]');
                    if (headerCb) {
                        // Unlink automatic coupling between accordion open/close and checkbox state
                        if (acc.onVisibleCheckboxChange && !acc._fluidUnlinked) {
                            acc._fluidUnlinked = true;
                            acc.onChecked = function () {};
                            acc.onVisibleCheckboxChange = function () {
                                const gCb = document.querySelector("#" + acc.id + "-checkbox input");
                                if (gCb && acc.visibleCheckbox) {
                                    gCb.checked = acc.visibleCheckbox.checked;
                                    if (typeof updateInput === 'function') updateInput(gCb);
                                }
                            };
                        }

                        return {
                            type: 'input-accordion',
                            hasToggle: true,
                            isEnabled: () => !!headerCb.checked,
                            toggle: () => {
                                headerCb.checked = !headerCb.checked;
                                headerCb.dispatchEvent(new Event('change', { bubbles: true }));
                                headerCb.dispatchEvent(new Event('input', { bubbles: true }));
                                if (acc.onVisibleCheckboxChange) {
                                    acc.onVisibleCheckboxChange();
                                } else {
                                    const gCb = document.querySelector("#" + acc.id + "-checkbox input");
                                    if (gCb) {
                                        gCb.checked = headerCb.checked;
                                        if (typeof updateInput === 'function') updateInput(gCb);
                                    }
                                }
                            },
                            bind: (cb) => {
                                headerCb.addEventListener('change', cb);
                                headerCb.addEventListener('input', cb);
                            }
                        };
                    }

                    // 2. ControlNet multi-unit structure
                    if (acc.id && (acc.id.includes('controlnet') || acc.classList.contains('controlnet'))) {
                        const getUnits = () => Array.from(acc.querySelectorAll('[id*="controlnet_enable"] input[type="checkbox"], .cnet-unit-active input, [id*="_enable"] input[type="checkbox"]'));
                        return {
                            type: 'controlnet',
                            hasToggle: true,
                            isEnabled: () => {
                                const units = getUnits();
                                return units.length > 0 && units.some(u => u.checked);
                            },
                            toggle: () => {
                                const units = getUnits();
                                if (units.length > 0) {
                                    const anyActive = units.some(u => u.checked);
                                    if (anyActive) {
                                        units.forEach(u => {
                                            if (u.checked) {
                                                u.checked = false;
                                                u.dispatchEvent(new Event('change', { bubbles: true }));
                                                u.dispatchEvent(new Event('input', { bubbles: true }));
                                            }
                                        });
                                    } else {
                                        units[0].checked = true;
                                        units[0].dispatchEvent(new Event('change', { bubbles: true }));
                                        units[0].dispatchEvent(new Event('input', { bubbles: true }));
                                    }
                                }
                            },
                            bind: (cb) => {
                                const units = getUnits();
                                units.forEach(u => {
                                    u.addEventListener('change', cb);
                                    u.addEventListener('input', cb);
                                });
                            }
                        };
                    }

                    // 3. Triton INT8 Fused GEMM & Explicit Master Checkboxes
                    const masterEnableCb = acc.querySelector(
                        '#triton-int8-gemm-enable input[type="checkbox"], ' +
                        '[id*="triton"][id*="enable" i] input[type="checkbox"], ' +
                        '[id*="triton"] input[type="checkbox"], ' +
                        '[id*="-enable"] input[type="checkbox"], ' +
                        '[id*="_enable"] input[type="checkbox"], ' +
                        'input[type="checkbox"][id*="enable" i], ' +
                        'input[type="checkbox"][id*="active" i], ' +
                        '.enable-checkbox input[type="checkbox"]'
                    );
                    if (masterEnableCb && !masterEnableCb.classList.contains('input-accordion-checkbox')) {
                        return {
                            type: 'master-checkbox',
                            hasToggle: true,
                            isEnabled: () => !!masterEnableCb.checked,
                            toggle: () => {
                                masterEnableCb.checked = !masterEnableCb.checked;
                                masterEnableCb.dispatchEvent(new Event('change', { bubbles: true }));
                                masterEnableCb.dispatchEvent(new Event('input', { bubbles: true }));
                            },
                            bind: (cb) => {
                                masterEnableCb.addEventListener('change', cb);
                                masterEnableCb.addEventListener('input', cb);
                            }
                        };
                    }

                    // 4. Torch Compile & Preset Dropdowns
                    const dropdown = acc.querySelector('.gradio-dropdown, div[class*="dropdown"], select');
                    const isCompile = (acc.id && acc.id.toLowerCase().includes('compile')) || 
                                      (acc.textContent && acc.textContent.toLowerCase().includes('compile'));

                    if (dropdown) {
                        let isSyncingVisual = false;
                        const syncDropdownOptionsVisual = () => {
                            if (isSyncingVisual) return;
                            const ul = dropdown.querySelector('.options, ul[role="listbox"], ul');
                            if (!ul) return;

                            const currentSelected = (dropdown.dataset.selectedVal || (dropdown.querySelector('input') ? dropdown.querySelector('input').value : '') || '').replace(/[✔✓\s]/g, '').trim().toLowerCase();
                            if (!currentSelected) return;

                            const items = Array.from(ul.querySelectorAll('li[data-index], li.item, [role="option"]'));
                            if (items.length === 0) return;

                            isSyncingVisual = true;
                            try {
                                items.forEach(li => {
                                    const val = (li.dataset.value || li.getAttribute('aria-label') || li.textContent || '').replace(/[✔✓\s]/g, '').trim().toLowerCase();
                                    const isMatch = (val === currentSelected) ||
                                                    (currentSelected === 'dynamic' && val === 'dynamic') ||
                                                    (currentSelected.includes('no-cudagraph') && val.includes('no-cudagraph')) ||
                                                    (currentSelected === 'disable' && val === 'disable') ||
                                                    (currentSelected === 'automatic' && val === 'automatic');

                                    if (li.classList.contains('selected') !== isMatch) {
                                        li.classList.toggle('selected', isMatch);
                                    }
                                    if (li.getAttribute('aria-selected') !== (isMatch ? 'true' : 'false')) {
                                        li.setAttribute('aria-selected', isMatch ? 'true' : 'false');
                                    }
                                    
                                    const chk = li.querySelector('.check, .inner-item, span');
                                    if (chk && (chk.classList.contains('inner-item') || chk.classList.contains('check') || chk.textContent.includes('✓') || chk.textContent.includes('✔'))) {
                                        if (chk.classList.contains('hide') !== !isMatch) {
                                            chk.classList.toggle('hide', !isMatch);
                                        }
                                    }
                                });
                            } finally {
                                isSyncingVisual = false;
                            }
                        };

                        // Capture phase listener: ensure click on child elements sets data-index and dataset.selectedVal
                        if (!dropdown._fluidBoundClick) {
                            dropdown._fluidBoundClick = true;
                            dropdown.addEventListener('mousedown', (e) => {
                                const li = e.target.closest('li[data-index], li.item, [role="option"]');
                                if (li) {
                                    if (!e.target.dataset.index && li.dataset.index) {
                                        e.target.dataset.index = li.dataset.index;
                                    }
                                    const val = (li.dataset.value || li.getAttribute('aria-label') || li.textContent || '').replace(/[✔✓\s]/g, '').trim();
                                    if (val) {
                                        dropdown.dataset.selectedVal = val;
                                        dropdown.dataset.lastPreset = val;
                                        const input = dropdown.querySelector('input');
                                        if (input) {
                                            input.value = val;
                                        }
                                    }
                                }
                            }, true);
                        }

                        const getVal = () => {
                            if (dropdown.dataset.selectedVal) {
                                return dropdown.dataset.selectedVal.replace(/[✔✓\s]/g, '').trim();
                            }
                            const input = dropdown.querySelector('input');
                            if (input && input.value) {
                                const val = input.value.replace(/[✔✓\s]/g, '').trim();
                                if (val) return val;
                            }
                            const selectedLi = dropdown.querySelector('li.selected, .options li.selected, li[aria-selected="true"]');
                            if (selectedLi) {
                                const val = (selectedLi.dataset.value || selectedLi.getAttribute('aria-label') || selectedLi.textContent || '').replace(/[✔✓\s]/g, '').trim();
                                if (val) return val;
                            }
                            const select = dropdown.querySelector('select');
                            if (select && select.value) {
                                return select.value.replace(/[✔✓\s]/g, '').trim();
                            }
                            return '';
                        };
                        const isValDisabled = (val) => {
                            const v = (val || '').toLowerCase();
                            return !v || v === 'disable' || v === 'disabled' || v === 'off' || v === 'none';
                        };

                        const setVal = (target) => {
                            if (!target) return;
                            const normTarget = target.trim().toLowerCase();

                            // 0. Resolve exact choice casing from known choices or DOM options
                            let exactName = target;
                            const knownChoices = ['Automatic', 'Disable', 'guard_filter_fn', 'dynamic', 'max-autotune', 'max-autotune-no-cudagraphs', 'reduce-overhead'];
                            for (const choice of knownChoices) {
                                const normChoice = choice.toLowerCase();
                                if (normChoice === normTarget ||
                                    (normTarget === 'dynamic' && normChoice === 'dynamic') ||
                                    (normTarget.includes('no-cudagraph') && normChoice.includes('no-cudagraph')) ||
                                    (normTarget === 'disable' && normChoice === 'disable') ||
                                    (normTarget === 'automatic' && normChoice === 'automatic')) {
                                    exactName = choice;
                                    break;
                                }
                            }

                            dropdown.dataset.selectedVal = exactName;
                            dropdown.dataset.lastPreset = exactName;

                            // 1. Standard HTML <select> support
                            const select = dropdown.querySelector('select');
                            if (select) {
                                for (const opt of Array.from(select.options)) {
                                    const optVal = opt.value.trim().toLowerCase();
                                    const optTxt = opt.text.trim().toLowerCase();
                                    if (optVal === normTarget || optTxt === normTarget ||
                                        optVal === exactName.toLowerCase() || optTxt === exactName.toLowerCase() ||
                                        (normTarget === 'dynamic' && (optVal === 'dynamic' || optTxt === 'dynamic')) ||
                                        (normTarget.includes('no-cudagraph') && (optVal.includes('no-cudagraph') || optTxt.includes('no-cudagraph')))) {
                                        select.value = opt.value;
                                        select.dispatchEvent(new Event('change', { bubbles: true }));
                                        select.dispatchEvent(new Event('input', { bubbles: true }));
                                        break;
                                    }
                                }
                            }

                            // 2. Open dropdown list if needed and select matching option item
                            const selectOption = () => {
                                const wrap = dropdown.querySelector('.wrap, .wrap-inner, input');
                                if (wrap) {
                                    wrap.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window }));
                                    wrap.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
                                }

                                const ul = dropdown.querySelector('.options, ul[role="listbox"], ul');
                                if (ul) {
                                    const items = Array.from(ul.querySelectorAll('li[data-index], li.item, [role="option"], li'));
                                    for (const it of items) {
                                        const val = (it.dataset.value || it.getAttribute('aria-label') || it.textContent || '').replace(/[✔✓\s]/g, '').trim().toLowerCase();
                                        if (val === normTarget || 
                                            val === exactName.toLowerCase() ||
                                            (normTarget === 'dynamic' && val === 'dynamic') || 
                                            (normTarget.includes('no-cudagraph') && val.includes('no-cudagraph')) ||
                                            (normTarget === 'disable' && val === 'disable') ||
                                            (normTarget === 'automatic' && val === 'automatic')) {
                                            it.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window }));
                                            it.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, view: window }));
                                            it.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
                                            break;
                                        }
                                    }
                                }

                                const input = dropdown.querySelector('input');
                                if (input) {
                                    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
                                    if (nativeInputValueSetter) {
                                        nativeInputValueSetter.call(input, exactName);
                                    } else {
                                        input.value = exactName;
                                    }

                                    input.dispatchEvent(new Event('input', { bubbles: true }));
                                    input.dispatchEvent(new Event('change', { bubbles: true }));
                                    if (typeof updateInput === 'function') {
                                        updateInput(input);
                                    }

                                    input.dispatchEvent(new KeyboardEvent('keydown', {
                                        key: 'Enter',
                                        code: 'Enter',
                                        keyCode: 13,
                                        which: 13,
                                        bubbles: true,
                                        cancelable: true
                                    }));
                                    input.dispatchEvent(new KeyboardEvent('keyup', {
                                        key: 'Enter',
                                        code: 'Enter',
                                        keyCode: 13,
                                        which: 13,
                                        bubbles: true,
                                        cancelable: true
                                    }));
                                }

                                syncDropdownOptionsVisual();
                            };

                            selectOption();
                            setTimeout(selectOption, 30);
                            setTimeout(selectOption, 100);
                        };

                        return {
                            type: isCompile ? 'torch-compile' : 'dropdown',
                            hasToggle: true,
                            dropdown: dropdown,
                            getVal: getVal,
                            setVal: setVal,
                            isEnabled: () => !isValDisabled(getVal()),
                            toggle: () => {
                                const currentVal = getVal();
                                const disabled = isValDisabled(currentVal);
                                const defaultFallback = isCompile ? 'dynamic' : 'Automatic';
                                const target = disabled ? (dropdown.dataset.lastPreset || defaultFallback) : 'Disable';
                                if (!disabled && currentVal) {
                                    dropdown.dataset.lastPreset = currentVal;
                                }
                                setVal(target);
                            },
                            bind: (cb) => {
                                dropdown.addEventListener('change', cb);
                                dropdown.addEventListener('input', cb);
                                const observer = new MutationObserver((mutations) => {
                                    const hasChildChanges = mutations.some(m => m.type === 'childList');
                                    if (hasChildChanges) {
                                        syncDropdownOptionsVisual();
                                    }
                                    cb();
                                });
                                observer.observe(dropdown, { childList: true, subtree: true });
                            }
                        };
                    }

                    // 6. Fallback for generic accordions (no master on/off switch)
                    return {
                        type: 'generic',
                        hasToggle: false,
                        isEnabled: () => false,
                        toggle: () => {},
                        bind: () => {}
                    };
                };

                allAccordions.forEach((acc, idx) => {
                    acc.classList.add('fluid-docked-accordion');
                    const accId = `${tab}_${acc.id || 'acc_' + idx}`;

                    const controller = getAccordionController(acc);
                    acc._fluidController = controller;

                    // Extract Title text
                    const labelWrap = acc.querySelector(':scope > button.label-wrap, :scope > .label-wrap, :scope > summary, .label-wrap, summary, .gr-accordion-title') || acc.firstElementChild;
                    let titleText = 'Module';
                    if (labelWrap) {
                        const span = labelWrap.querySelector('span');
                        titleText = (span ? span.textContent : labelWrap.textContent) || 'Module';
                        titleText = titleText.replace(/[\u25BC\u25B6\u25B7\u25BD▼▶▷]/g, '').trim();
                    }

                    // Add a clean Close button inside the opened drawer header if missing
                    if (labelWrap && !labelWrap.querySelector('.fluid-drawer-close-btn')) {
                        const closeBtn = document.createElement('span');
                        closeBtn.className = 'fluid-drawer-close-btn';
                        closeBtn.innerText = '✕ Close';
                        closeBtn.title = 'Close drawer';
                        closeBtn.onclick = (e) => {
                            e.stopPropagation();
                            closeAccordion(acc);
                            syncAllStates();
                        };
                        labelWrap.appendChild(closeBtn);
                    }

                    let chip = chipsContainer.querySelector(`.fluid-dock-chip[data-acc-id="${accId}"]`);
                    if (!chip) {
                        chip = document.createElement('button');
                        chip.type = 'button';
                        chip.className = 'fluid-dock-chip';
                        chip.dataset.accId = accId;

                        let shortcutHtml = '';
                        if (controller.type === 'torch-compile') {
                            chip.classList.add('fluid-chip-has-shortcuts');
                            shortcutHtml = `
                                <span class="fluid-chip-shortcuts">
                                    <span class="fluid-chip-sub-btn" data-preset="dynamic" title="Set Torch Compile to dynamic">Dynamic</span>
                                    <span class="fluid-chip-sub-btn" data-preset="max-autotune-no-cudagraphs" title="Set Torch Compile to max-autotune-no-cudagraphs">Max-Autotune (No-CUDA)</span>
                                </span>
                            `;
                        }

                        chip.innerHTML = `
                            <span class="fluid-chip-dot ${controller.isEnabled() ? 'active' : ''}"></span>
                            <span class="fluid-chip-title">${titleText}</span>
                            ${shortcutHtml}
                        `;

                        // 1. FAST SWITCH FLOW: Clicking dot toggles module state without opening drawer
                        const dot = chip.querySelector('.fluid-chip-dot');
                        if (controller.hasToggle) {
                            dot.title = controller.isEnabled() ? 'Active (Click to disable)' : 'Inactive (Click to enable)';
                            dot.onclick = (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                controller.toggle();
                                setTimeout(syncAllStates, 30);
                            };
                            controller.bind(() => {
                                syncAllStates();
                            });
                        } else {
                            dot.style.display = 'none';
                        }

                        // 2. SHORTCUT BUTTONS (For Torch Compile)
                        if (controller.type === 'torch-compile') {
                            const subBtns = chip.querySelectorAll('.fluid-chip-sub-btn');
                            subBtns.forEach(btn => {
                                btn.onclick = (e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    const targetPreset = btn.dataset.preset;
                                    const currentVal = (controller.getVal() || '').trim().toLowerCase();
                                    const normPreset = (targetPreset || '').trim().toLowerCase();
                                    
                                    // Toggle logic: If currently set to this preset, toggle to Disable; otherwise switch to target preset
                                    const isCurrent = (currentVal === normPreset) ||
                                                      (normPreset === 'dynamic' && currentVal === 'dynamic') ||
                                                      (normPreset.includes('no-cudagraph') && currentVal.includes('no-cudagraph'));

                                    if (isCurrent) {
                                        controller.setVal('Disable');
                                    } else {
                                        controller.setVal(targetPreset);
                                    }
                                    setTimeout(syncAllStates, 40);
                                    setTimeout(syncAllStates, 150);
                                };
                            });
                        }

                        // 3. DRAWER TOGGLE FLOW: Clicking chip opens/closes drawer without modifying enabled states
                        chip.onclick = (e) => {
                            if (e.target.closest('.fluid-chip-dot') || e.target.closest('.fluid-chip-sub-btn')) return;
                            e.preventDefault();
                            e.stopPropagation();
                            const currentlyOpen = checkIsOpen(acc);

                            if (currentlyOpen) {
                                closeAccordion(acc);
                            } else {
                                allAccordions.forEach(otherAcc => {
                                    if (otherAcc !== acc) closeAccordion(otherAcc);
                                });
                                openAccordion(acc);
                            }

                            setTimeout(syncAllStates, 30);
                        };

                        chipsContainer.appendChild(chip);
                    }

                    // Default Startup Behavior: Keep drawers CLOSED by default
                    if (!chip.classList.contains('panel-open')) {
                        closeAccordion(acc);
                    }
                });

                const syncAllStates = () => {
                    allAccordions.forEach((a, i) => {
                        const aId = `${tab}_${a.id || 'acc_' + i}`;
                        const aOpen = checkIsOpen(a);
                        const c = chipsContainer.querySelector(`.fluid-dock-chip[data-acc-id="${aId}"]`);
                        if (c) {
                            c.classList.toggle('panel-open', aOpen);
                            const controller = a._fluidController;
                            if (controller) {
                                const active = controller.isEnabled();
                                const dot = c.querySelector('.fluid-chip-dot');
                                if (dot && controller.hasToggle) {
                                    dot.classList.toggle('active', active);
                                    dot.title = active ? 'Active (Click to disable)' : 'Inactive (Click to enable)';
                                }
                                c.classList.toggle('is-enabled', active);

                                // Update shortcut button active states (for Torch Compile)
                                if (controller.type === 'torch-compile' && controller.getVal) {
                                    const currentVal = (controller.getVal() || '').trim().toLowerCase();
                                    c.querySelectorAll('.fluid-chip-sub-btn').forEach(btn => {
                                        const preset = (btn.dataset.preset || '').trim().toLowerCase();
                                        const isSelected = ((currentVal === preset) ||
                                                           (preset === 'dynamic' && currentVal === 'dynamic') ||
                                                           (preset.includes('no-cudagraph') && currentVal.includes('no-cudagraph'))) &&
                                                           currentVal !== 'disable' && currentVal !== 'disabled' && currentVal !== 'off' && currentVal !== 'none';
                                        btn.classList.toggle('active', isSelected);
                                    });
                                }
                            }
                        }
                        
                        a.style.display = aOpen ? 'block' : 'none';
                        const pGroup = a.closest('#' + tab + '_controlnet');
                        if (pGroup) pGroup.style.display = aOpen ? 'block' : 'none';
                    });
                };

                syncAllStates();

                // Remove stale chips
                chipsContainer.querySelectorAll('.fluid-dock-chip').forEach(c => {
                    const id = c.dataset.accId;
                    const exists = allAccordions.some((a, i) => `${tab}_${a.id || 'acc_' + i}` === id);
                    if (!exists) c.remove();
                });
            };

            initAccordionDock();
        });
    };

    // --- 3. MOBILE FLUIDITY INTERCEPTOR ---
    const initFluid = () => {
        if (!document.querySelector('.fluid-backdrop')) {
            const backdrop = document.createElement('div');
            backdrop.className = 'fluid-backdrop';
            document.body.appendChild(backdrop);
        }

        const tabs = ['txt2img', 'img2img'];

        tabs.forEach(tab => {
            const settingsCol = document.getElementById(`${tab}_settings`);
            const promptContainer = document.getElementById(`${tab}_prompt_container`) || document.getElementById(`${tab}_toprow`);
            const segPrompt = document.getElementById(`segmented_prompt_accordion_${tab}`) || document.querySelector(`[id*="segmented_prompt_accordion_${tab}"]`);

            // 1. Move Segmented Prompt directly below the main prompt area if it is trapped in settings
            if (segPrompt && promptContainer && promptContainer.parentNode) {
                if (segPrompt.closest(`#${tab}_settings`) || segPrompt.parentNode !== promptContainer.parentNode) {
                    promptContainer.parentNode.insertBefore(segPrompt, promptContainer.nextSibling);
                    segPrompt.style.marginTop = "8px";
                    segPrompt.style.marginBottom = "8px";
                }
            }

            // 2. Add Mobile Bottom Sheet Header Bar if missing
            if (settingsCol) {
                let sheetHeader = settingsCol.querySelector('.fluid-sheet-header');
                if (!sheetHeader) {
                    sheetHeader = document.createElement('div');
                    sheetHeader.className = 'fluid-sheet-header';
                    sheetHeader.innerHTML = `
                        <div class="fluid-sheet-handle"></div>
                        <div class="fluid-sheet-topbar">
                            <span class="fluid-sheet-title">Generation Parameters</span>
                            <button type="button" class="fluid-sheet-done-btn">✕ Done</button>
                        </div>
                    `;
                    const doneBtn = sheetHeader.querySelector('.fluid-sheet-done-btn');
                    doneBtn.onclick = (e) => {
                        e.preventDefault();
                        document.body.classList.remove('fluid-sheet-open');
                        document.querySelectorAll('.fluid-mobile-toggle span').forEach(el => {
                            el.innerText = '⎈ Configure Parameters';
                        });
                    };
                    settingsCol.insertBefore(sheetHeader, settingsCol.firstChild);
                }
            }

            // 3. Create and position the Mobile Toggle Button directly after Segmented Prompt (or promptContainer)
            let toggle = document.getElementById(`${tab}_mobile_toggle`);
            if (!toggle) {
                toggle = document.createElement('button');
                toggle.type = 'button';
                toggle.id = `${tab}_mobile_toggle`;
                toggle.className = 'fluid-mobile-toggle';
                toggle.innerHTML = '<span>⎈ Configure Parameters</span>';

                toggle.onclick = (e) => {
                    e.preventDefault();
                    document.body.classList.toggle('fluid-sheet-open');
                    const isOpen = document.body.classList.contains('fluid-sheet-open');
                    document.querySelectorAll('.fluid-mobile-toggle span').forEach(el => {
                        el.innerText = isOpen ? '✕ Close Parameters' : '⎈ Configure Parameters';
                    });
                };
            }

            const targetAnchor = segPrompt || promptContainer;
            if (targetAnchor && targetAnchor.parentNode) {
                if (toggle.previousElementSibling !== targetAnchor) {
                    targetAnchor.parentNode.insertBefore(toggle, targetAnchor.nextSibling);
                }
            } else if (settingsCol && settingsCol.parentNode) {
                if (toggle.nextElementSibling !== settingsCol) {
                    settingsCol.parentNode.insertBefore(toggle, settingsCol);
                }
            }
        });
        
        if (!window.fluidMobileListenerAttached) {
            window.fluidMobileListenerAttached = true;
            document.body.addEventListener('click', (e) => {
                if (document.body.classList.contains('fluid-sheet-open')) {
                    const isClickInsideSettings = e.target.closest('#txt2img_settings') || e.target.closest('#img2img_settings');
                    const isToggle = e.target.closest('.fluid-mobile-toggle');
                    
                    if (!isClickInsideSettings && !isToggle) {
                        document.body.classList.remove('fluid-sheet-open');
                        document.querySelectorAll('.fluid-mobile-toggle span').forEach(el => {
                            el.innerText = '⎈ Configure Parameters';
                        });
                    }
                }
            });
        }
    };

    // --- 4. FLOATING GENERATION ACTION BUTTONS & QUICKSETTINGS TRASH BUTTON ---
    const initQuicksettingsTrashButton = () => {
        const qs = document.getElementById('quicksettings') || document.querySelector('.quicksettings');
        if (!qs) return;
        if (document.getElementById('fluid_unload_models_btn')) return;

        const unloadBtn = document.createElement('button');
        unloadBtn.id = 'fluid_unload_models_btn';
        unloadBtn.type = 'button';
        unloadBtn.className = 'tool fluid-unload-trash-btn';
        unloadBtn.title = 'Unload All Models (Diffusion, LoRA, TE, VAE) from RAM & VRAM';
        unloadBtn.innerHTML = '🗑️';

        unloadBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            unloadBtn.innerHTML = '⏳';
            unloadBtn.style.opacity = '0.7';

            const realUnload = document.getElementById('sett_unload_sd_model');
            if (realUnload) {
                realUnload.click();
            }

            setTimeout(() => {
                unloadBtn.innerHTML = '✅';
                unloadBtn.style.opacity = '1';
                unloadBtn.classList.add('btn-success');

                setTimeout(() => {
                    unloadBtn.innerHTML = '🗑️';
                    unloadBtn.classList.remove('btn-success');
                    unloadBtn.style.opacity = '';
                }, 2000);
            }, 400);
        });

        qs.appendChild(unloadBtn);
    };

    const initFloatingGenerationActions = () => {
        const tabs = ['txt2img', 'img2img'];

        tabs.forEach(tab => {
            const generateBox = document.getElementById(`${tab}_generate_box`);
            const generateBtn = document.getElementById(`${tab}_generate`);
            if (!generateBox || !generateBtn) return;
            if (document.getElementById(`${tab}_fluid_btn_auto`)) return;

            const createBtn = (id, text, title, onClick) => {
                const btn = document.createElement('button');
                btn.id = id;
                btn.type = 'button';
                btn.className = 'fluid-float-action-btn';
                btn.innerHTML = text;
                btn.title = title;

                const flash = (orig, success) => {
                    if (btn._timer) clearTimeout(btn._timer);
                    btn.innerHTML = success;
                    btn.classList.add('btn-success');
                    btn._timer = setTimeout(() => {
                        btn.innerHTML = orig;
                        btn.classList.remove('btn-success');
                    }, 1500);
                };

                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onClick(btn, flash);
                });

                return btn;
            };

            const getTargetFields = () => {
                const fields = [];
                // ONLY negative prompt and text inside existing segment cards
                const negPrompt = document.querySelector(`#${tab}_neg_prompt textarea`);
                if (negPrompt) fields.push(negPrompt);

                const segTextareas = document.querySelectorAll(
                    `#segmented_prompt_accordion_${tab} .segmented-prompt-textarea textarea, [id^='seg_text_${tab}_'] textarea`
                );
                segTextareas.forEach(ta => {
                    if (ta && !fields.includes(ta)) fields.push(ta);
                });

                return fields;
            };

            const runFormat = (mode) => {
                const fields = getTargetFields();
                fields.forEach(field => {
                    if (!field || !field.value) return;

                    let networkDB = new Map();
                    let val = field.value;

                    // 1. Mask LoRA, LyCORIS, Hypernet, and Embedding tags
                    val = val.replace(/<[^>]+>/g, (match) => {
                        const uid = `@NET${networkDB.size}WORK@`;
                        networkDB.set(uid, match);
                        return uid;
                    });
                    val = val.replace(/\bembedding:[^\s,()]*/gi, (match) => {
                        const uid = `@NET${networkDB.size}WORK@`;
                        networkDB.set(uid, match);
                        return uid;
                    });

                    // 2. Split lines & format
                    const lines = val.split('\n');
                    for (let i = 0; i < lines.length; i++) {
                        let line = lines[i];
                        line = line.replace(/[^\S\n]/g, ' ');
                        line = line.replace(/\s+(\)|\]|\>|\})/g, '$1').replace(/(\(|\[|\<|\{)\s+/g, '$1');
                        line = line.replace(/,+(\)|\]|\>|\})/g, '$1,').replace(/(\(|\[|\<|\{),+/g, ',$1');
                        line = line.replace(/\s*\|\s*/g, '|').replace(/\s*\:\s*/g, ':');
                        line = line.replace(/\,\s*\./g, '.').replace(/\s*\.(\n|$)/g, '.$1');

                        if (mode === 'underscore' || mode === 'auto') {
                            line = line.replace(/(^|[^_])_([^_]|$)/g, '$1 $2');
                        }

                        let tags = line.split(',').map(w => w.trim()).filter(w => w);
                        if (mode === 'dedupe' || mode === 'auto') {
                            const unique = new Set();
                            const filtered = [];
                            for (const t of tags) {
                                const clean = t.replace(/\[|\]|\(|\)/g, '').trim().toLowerCase();
                                if (/^(and|break|addrow|addcol)$/i.test(clean) || !isNaN(clean)) {
                                    filtered.push(t);
                                } else if (!unique.has(clean)) {
                                    unique.add(clean);
                                    filtered.push(t);
                                }
                            }
                            tags = filtered;
                        }
                        lines[i] = tags.join(', ').replace(/\s+/g, ' ');
                    }
                    val = lines.join('\n');

                    // 3. Restore masked LoRA & Embedding tags
                    for (let i = networkDB.size - 1; i >= 0; i--) {
                        const uid = `@NET${i}WORK@`;
                        if (networkDB.has(uid)) {
                            val = val.split(uid).join(networkDB.get(uid));
                        }
                    }

                    field.value = val;
                    if (typeof updateInput === 'function') {
                        updateInput(field);
                    } else {
                        field.dispatchEvent(new Event('input', { bubbles: true }));
                        field.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                });
            };

            const autoBtn = createBtn(
                `${tab}_fluid_btn_auto`,
                'Auto Format',
                'Auto Format: Clean punctuation & format negative prompt and segment cards',
                (btn, flash) => {
                    runFormat('auto');
                    flash('Auto Format', '✅ Formatted!');
                }
            );

            const dedupeBtn = createBtn(
                `${tab}_fluid_btn_dedupe`,
                'RMV Duplicate',
                'Remove Duplicates: Deduplicate tags in negative prompt and segment cards',
                (btn, flash) => {
                    runFormat('dedupe');
                    flash('RMV Duplicate', '✅ Deduped!');
                }
            );

            const underscoreBtn = createBtn(
                `${tab}_fluid_btn_underscore`,
                'RMV Underscore',
                'Remove Underscores: Convert underscores to spaces in negative prompt and segment cards',
                (btn, flash) => {
                    runFormat('underscore');
                    flash('RMV Underscore', '✅ Cleaned!');
                }
            );

            generateBox.appendChild(autoBtn);
            generateBox.appendChild(dedupeBtn);
            generateBox.appendChild(underscoreBtn);
        });
    };

    // Master Lifecycle Initializer with Anti-Loop & Re-entrancy Lock
    let isBooting = false;
    let bootDebounce = null;

    const boot = () => {
        if (isBooting) return;
        isBooting = true;
        try {
            initTheme();
            initCodexCockpit();
            initFluid();
            initQuicksettingsTrashButton();
            initFloatingGenerationActions();
        } catch (err) {
            console.warn("[Fluid UI] Hydration warning:", err);
        } finally {
            isBooting = false;
        }
    };

    const debouncedBoot = () => {
        if (isBooting) return;
        if (bootDebounce) clearTimeout(bootDebounce);
        bootDebounce = setTimeout(boot, 200);
    };

    // 1. Apply theme early
    initTheme();

    // 2. Full layout hydration runs safely after WebUI / Gradio is ready
    if (typeof onUiLoaded === 'function') {
        onUiLoaded(boot);
    } else {
        document.addEventListener("DOMContentLoaded", () => {
            if (typeof onUiLoaded === 'function') {
                onUiLoaded(boot);
            } else {
                setTimeout(boot, 500);
            }
        });
    }

    // 3. Debounced observer strictly for tab switching and late-loading extensions
    if (window.fluidObserver) window.fluidObserver.disconnect();
    window.fluidObserver = new MutationObserver((mutations) => {
        if (isBooting) return;
        const shouldUpdate = mutations.some(m => {
            if (!m.target) return false;
            const t = m.target;
            return t.id === 'txt2img_settings' || t.id === 'img2img_settings' || 
                   (t.classList && t.classList.contains('gradio-tabs')) || t.id === 'tabs';
        });
        if (shouldUpdate) {
            debouncedBoot();
        }
    });

    if (document.body) {
        window.fluidObserver.observe(document.body, { childList: true, subtree: true });
    }
})();
