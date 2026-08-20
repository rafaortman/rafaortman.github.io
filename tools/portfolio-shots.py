#!/usr/bin/env python
"""
Gera os thumbnails do portfolio (desktop + mobile) para cada item da lista.
- Desktop: 600x338 (16:9, box CSS .desktop 300x169 @2x)
- Mobile:  200x400 (1:2,  box CSS .mobile  100x200 @2x)
Corte "cover" com ancora no topo. Saida em /img como JPEG.
Reexecutar para atualizar os prints:  python tools/portfolio-shots.py
"""
import os
import math
import time
from playwright.sync_api import sync_playwright, TimeoutError as PWTimeout
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG_DIR = os.path.join(ROOT, "img")
os.makedirs(IMG_DIR, exist_ok=True)

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36")
STEALTH = "Object.defineProperty(navigator,'webdriver',{get:()=>undefined});"

# slug -> url  (ordem = lista do index.html)
ITEMS = [
    ("meio",          "https://canalmeio.com.br/"),
    ("servdes2023",   "https://servdes2023.org/"),
    ("caicaras",      "https://caicaras.com.br/"),
    ("ppgd",          "https://ppgd.direito.ufrj.br/"),
    ("observatorioseguranca", "https://observatorioseguranca.com.br/"),
    ("atletas",       "https://atletaspelobrasil.org.br/"),
    ("decodifica",    "https://decodifica.org/"),
    ("ursulatautz",   "https://ursulatautz.com/"),
    ("styleguide",    "https://rafaortman.github.io/styleguide/"),
    ("absolutecinema","https://rafaortman.github.io/absolutecinema/"),
]

DESKTOP = {"target": (600, 338), "viewport": {"width": 1280, "height": 720},
           "mobile": False}
MOBILE  = {"target": (200, 400), "viewport": {"width": 390, "height": 844},
           "mobile": True}


def cover(png_path, out_path, target):
    tw, th = target
    img = Image.open(png_path).convert("RGB")
    w, h = img.size
    scale = max(tw / w, th / h)
    nw, nh = math.ceil(w * scale), math.ceil(h * scale)
    img = img.resize((nw, nh), Image.LANCZOS)
    left = (nw - tw) // 2
    img = img.crop((left, 0, left + tw, th))  # ancora no topo
    img.save(out_path, "JPEG", quality=85, optimize=True)


def cf_cleared(page):
    t = (page.title() or "").lower()
    return not any(s in t for s in ("just a moment", "verify", "verifica"))


def shoot(context, slug, url, cfg):
    kind = "mobile" if cfg["mobile"] else "desktop"
    page = context.new_page()
    tmp = os.path.join(IMG_DIR, f".{slug}-{kind}.tmp.png")
    out = os.path.join(IMG_DIR, f"{slug}-{kind}.jpg")
    try:
        try:
            page.goto(url, wait_until="load", timeout=45000)
        except PWTimeout:
            print(f"   ! {slug}-{kind}: load timeout, capturando o que renderizou")
        for _ in range(20):            # espera eventual desafio Cloudflare liberar
            if cf_cleared(page):
                break
            time.sleep(1)
        page.wait_for_timeout(3500)    # fontes / animacoes / lazy
        page.screenshot(path=tmp, clip={"x": 0, "y": 0,
                                        "width": cfg["viewport"]["width"],
                                        "height": cfg["viewport"]["height"]})
        cover(tmp, out, cfg["target"])
        print(f"   ok {os.path.basename(out)}  {cfg['target'][0]}x{cfg['target'][1]}")
    except Exception as e:
        print(f"   ERRO {slug}-{kind}: {e}")
    finally:
        if os.path.exists(tmp):
            os.remove(tmp)
        page.close()


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(
            args=["--disable-blink-features=AutomationControlled"])
        common = dict(device_scale_factor=2, user_agent=UA,
                      locale="pt-BR", timezone_id="America/Sao_Paulo")
        dctx = browser.new_context(viewport=DESKTOP["viewport"], **common)
        mctx = browser.new_context(viewport=MOBILE["viewport"],
                                   is_mobile=True, has_touch=True, **common)
        for ctx in (dctx, mctx):
            ctx.add_init_script(STEALTH)
        for slug, url in ITEMS:
            print(f"-> {slug}  ({url})")
            shoot(dctx, slug, url, DESKTOP)
            shoot(mctx, slug, url, MOBILE)
        dctx.close()
        mctx.close()
        browser.close()
    print("\nConcluido.")


if __name__ == "__main__":
    main()
