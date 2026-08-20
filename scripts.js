(function () {
    "use strict";
    var $$ = function (sel, ctx) {
        return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
    };

    // iOS: marca .banana
    if (/(iPad|iPhone)/i.test(navigator.userAgent)) {
        $$(".banana").forEach(function (el) { el.classList.add("ios"); });
    }

    // Troca de idioma
    $$("#idiomas button").forEach(function (btn) {
        btn.addEventListener("click", function () {
            document.documentElement.lang = this.getAttribute("data-idioma");
        });
    });

    // Tema: escolhe um aleatório ao carregar
    var ops = $$("[data-op]").map(function (el) { return el.getAttribute("data-op"); });
    var op = ops[Math.floor(Math.random() * ops.length)];
    if (op) {
        document.body.classList.add(op);
        $$('[data-op="' + op + '"]').forEach(function (el) { el.classList.add("ativo"); });
    }

    // Botões de troca de tema
    $$(".tema-ops button").forEach(function (btn) {
        btn.addEventListener("click", function () {
            var tema = this.getAttribute("data-op");
            var self = this;
            Array.prototype.forEach.call(this.parentNode.children, function (sib) {
                if (sib !== self) sib.classList.remove("ativo");
            });
            this.classList.add("ativo");
            document.body.className = "";
            document.body.classList.add(tema);
            var logo = document.querySelector(".logo-animado");
            if (logo) {
                var branding = document.querySelector("#branding");
                logo.remove();
                branding.appendChild(logo);
            }
        });
    });

    // Scroll spy: destaca o item de menu da seção que cruza o meio da tela
    var menuLinks = {};
    $$("#menuSite a").forEach(function (a) { menuLinks[a.getAttribute("href")] = a; });
    var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            var link = menuLinks["#" + entry.target.id];
            if (!link) return;
            $$("#menuSite a").forEach(function (a) { a.classList.remove("ativo"); });
            link.classList.add("ativo");
        });
    }, { rootMargin: "-50% 0px -50% 0px" });
    $$("section").forEach(function (s) { spy.observe(s); });

    // Ao carregar, sobe ao topo
    window.scrollTo(0, 0);
})();
