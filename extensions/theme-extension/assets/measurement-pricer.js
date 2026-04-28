(function () {
  var root = document.getElementById("measurement-pricer-root");
  if (!root) return;

  var state = {
    productId: root.dataset.productId || "",
    variantId: root.dataset.variantId || "",
    appProxyBase: root.dataset.appProxyBase || "/apps/measurement-pricer",
    buttonText: root.dataset.buttonText || "Buy now",
    depthEnabled: root.dataset.depthEnabled === "true",
    cropRequired: root.dataset.cropRequired === "true",
    unit: root.dataset.unit || "in",
    cropData: null,
    config: null,
    loading: false
  };

  function esc(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function num(v) {
    var n = parseFloat(v);
    return Number.isFinite(n) ? n : 0;
  }

  function roundPrice(value, mode) {
    var n = Number(value || 0);
    if (mode === "nearest_1") return Math.round(n);
    if (mode === "nearest_0_50") return Math.round(n * 2) / 2;
    if (mode === "nearest_0_25") return Math.round(n * 4) / 4;
    return Math.round(n * 100) / 100;
  }

  function getRule() {
    return state.config ? state.config.rule : null;
  }

  function formatMoney(value) {
    var amount = Number(value || 0);
    var currency = state.config && state.config.rule ? state.config.rule.currencyCode : "USD";

    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: currency
      }).format(amount);
    } catch (e) {
      return "$" + amount.toFixed(2);
    }
  }

  function localEstimate(width, height, depth) {
    var rule = getRule();
    if (!rule) return { area: 0, volume: 0, price: 0 };

    var w = num(width);
    var h = num(height);
    var d = num(depth);
    var area = w * h;
    var volume = area * d;
    var price = Number(rule.basePrice || 0);

    if (rule.formulaType === "area") {
      price += area * Number(rule.areaRate || 0);
    } else if (rule.formulaType === "area_plus_depth") {
      price += area * Number(rule.areaRate || 0);
      price += d * Number(rule.depthRate || 0);
    } else if (rule.formulaType === "volume") {
      price += volume * Number(rule.volumeRate || 0);
    } else {
      price += area * Number(rule.areaRate || 0);
    }

    return {
      area: area,
      volume: volume,
      price: roundPrice(price, rule.rounding),
    };
  }

  function getEls() {
    return {
      width: root.querySelector("[data-mp-width]"),
      height: root.querySelector("[data-mp-height]"),
      depth: root.querySelector("[data-mp-depth]"),
      email: root.querySelector("[data-mp-email]"),
      price: root.querySelector("[data-mp-price]"),
      area: root.querySelector("[data-mp-area]"),
      volume: root.querySelector("[data-mp-volume]"),
      error: root.querySelector("[data-mp-error]"),
      add: root.querySelector("[data-mp-add]"),
    };
  }

  function render() {
    root.innerHTML = [
      '<div class="mp-card">',
        '<div class="mp-field">',
          '<label class="mp-label">Width (' + esc(state.unit) + ')</label>',
          '<input class="mp-input" data-mp-width type="number" min="0" step="0.01" placeholder="Width">',
        '</div>',
        '<div class="mp-field">',
          '<label class="mp-label">Height (' + esc(state.unit) + ')</label>',
          '<input class="mp-input" data-mp-height type="number" min="0" step="0.01" placeholder="Height">',
        '</div>',
        state.depthEnabled ? (
          '<div class="mp-field">' +
            '<label class="mp-label">Depth (' + esc(state.unit) + ')</label>' +
            '<input class="mp-input" data-mp-depth type="number" min="0" step="0.01" placeholder="Depth">' +
          '</div>'
        ) : '',
        '<div class="mp-field">' +
          '<label class="mp-label">Email (optional)</label>' +
          '<input class="mp-input" data-mp-email type="email" placeholder="you@example.com">' +
        '</div>',
        '<div class="mp-crop-note">Attach cropper here and call window.MeasurementPricer.setCropData(data).</div>',
        '<div class="mp-summary">',
          '<div class="mp-row"><span>Estimated price</span><strong data-mp-price>$0.00</strong></div>',
          '<div class="mp-row"><span>Area</span><span data-mp-area>-</span></div>',
          state.depthEnabled ? '<div class="mp-row"><span>Volume</span><span data-mp-volume>-</span></div>' : '',
        '</div>',
        '<div class="mp-error" data-mp-error></div>',
        '<button type="button" class="mp-btn" data-mp-add>' + esc(state.buttonText) + '</button>',
      '</div>'
    ].join("");
  }

  function setError(message) {
    var els = getEls();
    if (els.error) els.error.textContent = message || "";
  }

  function setLoading(isLoading) {
    state.loading = isLoading;
    var els = getEls();
    if (els.add) {
      els.add.disabled = isLoading;
      els.add.textContent = isLoading ? "Processing..." : state.buttonText;
    }
  }

  function updateEstimate() {
    var els = getEls();
    var result = localEstimate(
      els.width ? els.width.value : "",
      els.height ? els.height.value : "",
      els.depth ? els.depth.value : ""
    );

    if (els.price) els.price.textContent = formatMoney(result.price);
    if (els.area) els.area.textContent = result.area ? result.area.toFixed(2) + " sq " + state.unit : "-";
    if (els.volume) els.volume.textContent = result.volume ? result.volume.toFixed(2) + " cu " + state.unit : "-";
  }

  function bindInputs() {
    var els = getEls();
    if (els.width) els.width.addEventListener("input", updateEstimate);
    if (els.height) els.height.addEventListener("input", updateEstimate);
    if (els.depth) els.depth.addEventListener("input", updateEstimate);
  }

  async function loadConfig() {
    var url = state.appProxyBase + "/config?productId=" + encodeURIComponent(state.productId) + "&variantId=" + encodeURIComponent(state.variantId);
    var res = await fetch(url, { method: "GET" });
    var data = await res.json();

    if (!res.ok || !data.ok) {
      throw new Error(data.error || "Failed to load config.");
    }

    state.config = data.config;
    state.depthEnabled = !!data.config.rule.depthEnabled;
    state.cropRequired = !!data.config.cropRequired;
    state.unit = data.config.rule.unit || state.unit;
  }

  async function validateWithBackend() {
    var els = getEls();

    var payload = {
      productId: state.productId,
      variantId: state.variantId,
      width: els.width ? els.width.value : "",
      height: els.height ? els.height.value : "",
      depth: els.depth ? els.depth.value : 0,
      cropData: state.cropData || null
    };

    var res = await fetch(state.appProxyBase + "/validate-price", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    var data = await res.json();

    if (!res.ok || !data.ok) {
      throw new Error(data.error || "Price validation failed.");
    }

    return data;
  }

  async function createDraftOrder(validated) {
    var els = getEls();

    var payload = {
      productId: state.productId,
      variantId: state.variantId,
      width: validated.width || (els.width ? els.width.value : ""),
      height: validated.height || (els.height ? els.height.value : ""),
      depth: validated.depth || (els.depth ? els.depth.value : 0),
      cropData: state.cropData || null,
      email: els.email ? els.email.value : "",
      quantity: 1
    };

    var res = await fetch(state.appProxyBase + "/buy-now", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    var data = await res.json();

    if (!res.ok || !data.ok) {
      throw new Error(data.error || "Unable to create checkout.");
    }

    return data;
  }

  async function handleSubmit() {
    if (state.loading) return;

    try {
      setError("");
      setLoading(true);

      if (state.cropRequired && !state.cropData) {
        throw new Error("Please complete image crop before continuing.");
      }

      var validatedResponse = await validateWithBackend();
      var draftOrderResponse = await createDraftOrder(validatedResponse.validated || {});

      if (!draftOrderResponse.invoiceUrl) {
        throw new Error("Checkout link was not returned.");
      }

      window.location.href = draftOrderResponse.invoiceUrl;
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function bindSubmit() {
    var els = getEls();
    if (els.add) els.add.addEventListener("click", handleSubmit);
  }

  function exposeApi() {
    window.MeasurementPricer = window.MeasurementPricer || {};
    window.MeasurementPricer.setCropData = function (cropData) {
      state.cropData = cropData;
    };
    window.MeasurementPricer.getState = function () {
      return JSON.parse(JSON.stringify(state));
    };
    window.MeasurementPricer.refreshEstimate = function () {
      updateEstimate();
    };
  }

  async function init() {
    render();
    exposeApi();

    try {
      await loadConfig();
      render();
      bindInputs();
      bindSubmit();
      updateEstimate();
    } catch (err) {
      render();
      setError(err.message || "Unable to initialize pricing widget.");
    }
  }

  init();
})();
