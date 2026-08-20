# Thumbnails do portfólio

Gera os prints **desktop + mobile** de cada item do portfólio. Eles entram como
`background-image` inline (cover) nos `.desktop` / `.mobile` de cada `<li>` do
`index.html`.

## Setup (uma vez)

```bash
pip install playwright pillow
python -m playwright install chromium
```

## Gerar / atualizar todos os prints

```bash
python tools/portfolio-shots.py
```

Sobrescreve os JPEGs em `img/`. Para cada item da lista `ITEMS` (dentro do
script) sai `img/<slug>-desktop.jpg` e `img/<slug>-mobile.jpg`.

Como funciona (já embutido no script, não precisa mexer):

- **Dimensões:** desktop `600×338` (16:9), mobile `200×400` (1:2) — 2× do box
  do CSS (`.desktop` 300×169, `.mobile` 100×200) para ficar nítido em telas retina.
- **Captura:** viewport desktop `1280×720`, mobile `390×844`, ambos com
  `device_scale_factor=2`; corte **cover** com âncora no topo (pega header/hero).
- **Anti-Cloudflare:** user-agent real, `navigator.webdriver` desligado e espera
  o desafio liberar antes do screenshot. Resolve sites atrás de CF (ex.: Meio).

## Adicionar um item novo

1. Adicione `("<slug>", "<url>")` na lista `ITEMS` em `portfolio-shots.py`.
2. Rode o script (gera os 2 prints do slug).
3. No `index.html`, dentro de `<ul class="portfolio-list">`, adicione:

   ```html
   <li>
       <a href="<url>" target="_blank">
           <div class="portifolio-item">
               <div class="desktop" style="background:url('img/<slug>-desktop.jpg') top center/cover"></div>
               <div class="mobile" style="background:url('img/<slug>-mobile.jpg') top center/cover"></div>
           </div>
           <span><nome do site></span>
       </a>
   </li>
   ```

## Pegar outro frame (carrossel / slideshow)

O script sempre captura o estado inicial da home. Se o site tiver carrossel e o
slide 1 não ficar bom, dá pra avançar **antes** do screenshot — é um ajuste
pontual, não precisa fixar por site no código.

Em `shoot()`, logo antes de `page.screenshot(...)`, insira temporariamente:

```python
# Slick: vai pro slide N (0-indexado) e pausa o autoplay
page.evaluate("""() => { try {
    var s = jQuery('.slick-slider').first();
    s.slick('slickGoTo', 4, true);   // 4 = 5o slide
    s.slick('slickPause');
} catch (e) {} }""")
page.wait_for_timeout(1200)
```

Genérico (qualquer slider com dots): clicar no dot desejado —
`page.locator('.slick-dots li button').nth(N).click()`.

Rode só para o item em questão (comente os outros em `ITEMS`) e **reverta o
tweak** depois. Assim a receita fica reprodutível sem carregar escolhas
eventuais.

## Conferir sem publicar

Abra os `.jpg` em `img/` direto, ou o `index.html` local no navegador.
