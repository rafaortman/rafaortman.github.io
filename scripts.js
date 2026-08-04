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

    // Smooth scroll para âncoras internas
    $$('a[href*="#"]').forEach(function (link) {
        link.addEventListener("click", function (e) {
            if (location.pathname.replace(/^\//, "") !== this.pathname.replace(/^\//, "") ||
                location.hostname !== this.hostname) return;
            var hash = this.hash;
            if (!hash || hash.length < 2) return;
            var target = document.querySelector(hash) ||
                document.querySelector('[name="' + hash.slice(1) + '"]');
            if (!target) return;
            e.preventDefault();
            window.scrollTo({
                top: target.getBoundingClientRect().top + window.pageYOffset,
                behavior: "smooth"
            });
            target.setAttribute("tabindex", "-1");
            target.focus({ preventScroll: true });
        });
    });

    // Menu: marca item ativo
    $$("#menuSite a").forEach(function (link) {
        link.addEventListener("click", function () {
            this.classList.toggle("ativo");
            var self = this;
            Array.prototype.forEach.call(this.parentNode.children, function (sib) {
                if (sib !== self) sib.classList.remove("ativo");
            });
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

    // Scroll spy
    var vh = window.innerHeight;
    if (window.pageYOffset < vh) {
        var first = document.querySelector("#menuSite a");
        if (first) first.classList.add("ativo");
    }
    window.addEventListener("scroll", function () {
        var top = window.pageYOffset, bottom = top + vh;
        var atual = document.querySelector(".secaoAtiva");
        var id = atual ? atual.getAttribute("id") : null;
        $$("#menuSite a").forEach(function (a) { a.classList.remove("ativo"); });
        if (id) {
            $$('a[href="#' + id + '"]').forEach(function (a) { a.classList.add("ativo"); });
        }
        var sections = $$("section");
        for (var i = 0; i < sections.length; i++) {
            var secTop = sections[i].getBoundingClientRect().top + window.pageYOffset;
            if (secTop + vh > top && secTop < bottom) {
                sections.forEach(function (s) { s.classList.remove("secaoAtiva"); });
                sections[i].classList.add("secaoAtiva");
                break;
            }
        }
    });

    // Ao carregar, sobe ao topo
    window.scrollTo({ top: 0, behavior: "smooth" });
})();
