(() => {
    const currentScript = document.currentScript;
    if (!(currentScript instanceof HTMLScriptElement)) return;

    const measurementId = currentScript.dataset.measurementId ?? '';
    if (!/^G-[A-Z0-9]{4,20}$/.test(measurementId)) return;

    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag(...args) {
        window.dataLayer.push(args);
    };
    window.gtag('js', new Date());
    window.gtag('config', measurementId);

    const loader = document.createElement('script');
    loader.async = true;
    loader.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    document.head.append(loader);
})();
