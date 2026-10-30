# Gera placas.html com as 4 placas de avaliação do Google.
# Para trocar o link do QR code, altere LINK e rode: python3 gerar_placas.py
import qrcode, os

LINK = "https://g.page/r/SEU-LINK-AQUI/review"
B = 3  # sangria em mm

def qr_svg(data, color="#000"):
    q = qrcode.QRCode(border=0, error_correction=qrcode.constants.ERROR_CORRECT_M)
    q.add_data(data); q.make(fit=True)
    m = q.get_matrix(); n = len(m)
    d = "".join(f"M{x},{y}h1v1h-1z" for y, row in enumerate(m) for x, v in enumerate(row) if v)
    return f'<svg viewBox="0 0 {n} {n}" shape-rendering="crispEdges"><path d="{d}" fill="{color}"/></svg>'

QR = qr_svg(LINK)

G_PATHS = '''<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
<path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>'''

def g_neon():
    out = []
    for p in G_PATHS.strip().split("\n"):
        col = p.split('fill="')[1][:7]
        d = p.split(' d="')[1].split('"')[0]
        out.append(f'<path d="{d}" fill="{col}" fill-opacity=".05" stroke="{col}" stroke-width=".22" stroke-linejoin="round" '
                   f'style="filter:drop-shadow(0 0 .3px {col}) drop-shadow(0 0 .9px {col}) drop-shadow(0 0 2px {col})"/>')
    return "\n".join(out)

WORDMARK = ('<span style="color:#4285F4">G</span><span style="color:#EA4335">o</span><span style="color:#FBBC05">o</span>'
            '<span style="color:#4285F4">g</span><span style="color:#34A853">l</span><span style="color:#EA4335">e</span>')

STAR = '<svg viewBox="0 0 24 24"><path fill="#F5B800" d="M12 1.8l3.1 6.6 7.2.9-5.3 5 1.4 7.1L12 17.9l-6.4 3.5 1.4-7.1-5.3-5 7.2-.9z"/></svg>'
STARS = lambda: '<div class="stars">' + STAR * 5 + '</div>'

# círculo / quadrado com contorno nas 4 cores (pathLength=4, uma cor por quarto)
def ring4(stroke, colors=("#FBBC05", "#34A853", "#4285F4", "#EA4335")):
    return '<svg viewBox="0 0 100 100" class="ring4">' + "".join(
        f'<circle cx="50" cy="50" r="{50-stroke/2}" fill="none" stroke="{c}" stroke-width="{stroke}" pathLength="4" '
        f'stroke-dasharray="1 3" stroke-dashoffset="{-k}"/>' for k, c in enumerate(colors)) + '</svg>'

def rect4(stroke, colors=("#EA4335", "#34A853", "#FBBC05", "#4285F4")):
    s = stroke / 2
    return '<svg viewBox="0 0 100 100" class="ring4">' + "".join(
        f'<rect x="{s}" y="{s}" width="{100-stroke}" height="{100-stroke}" rx="14" fill="none" stroke="{c}" stroke-width="{stroke}" '
        f'pathLength="4" stroke-dasharray="1 3" stroke-dashoffset="{-k}"/>' for k, c in enumerate(colors)) + '</svg>'

TAP = '''<svg class="tap" viewBox="0 0 170 130" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
<path d="M90 18 H33 a28 28 0 0 0 0 56 H100"/><path d="M38 38 q6 8 0 16"/><path d="M48 32 q11 14 0 28"/><path d="M58 26 q16 20 0 40"/>
<rect x="88" y="4" width="40" height="80" rx="6" transform="rotate(-14 108 44)"/><path d="M103 14 l12 -3"/>
<path d="M96 62 q-8 -2 -8 6 q2 6 10 2 l14 4"/><path d="M100 82 q4 20 24 18 q14 -2 14 -18"/>
<path d="M134 48 q8 0 6 8 q8 2 4 10 q8 4 0 12"/><path d="M112 106 l-4 20"/><path d="M134 98 l8 16"/></svg>'''

WAVES = '''<svg class="waves" viewBox="0 0 60 60" fill="none" stroke="currentColor" stroke-linecap="round">
<path d="M10 22 q6 8 0 16" stroke-width="6"/><path d="M22 14 q12 16 0 32" stroke-width="6"/><path d="M34 6 q18 24 0 48" stroke-width="6"/><path d="M46 0 q22 30 0 60" stroke-width="6"/></svg>'''

def sheet(id_, w, h, cls, inner, label):
    return (f'<figure><div class="sheet {cls}" id="{id_}" style="width:{w+2*B}mm;height:{h+2*B}mm">'
            f'<div class="trim" style="left:{B}mm;top:{B}mm;width:{w}mm;height:{h}mm">{inner}</div>'
            f'<div class="guide" style="inset:{B}mm"></div></div><figcaption>{label} · {w:g}×{h:g} mm</figcaption></figure>')

# ---------- 1. Display de mesa 100×150 ----------
p1 = f'''
<div class="p1-ring">{ring4(3.2, ("#FBBC05","#34A853","#4285F4","#EA4335"))}
  <div class="p1-text"><div class="p1-a">Avalie-nos</div><div class="p1-no">no</div><div class="word p1-g">{WORDMARK}</div></div></div>
<div class="p1-bottom">
  <div class="p1-nfc">{WAVES}<div class="p1-nfclbl">NFC</div></div>
  <div class="qr-tile p1-qr">{QR}</div>
</div>'''

# ---------- 2. Cartão 54×85,6 ----------
p2 = f'''
<div class="p2-notch">{WAVES}</div>
<div class="p2-g"><svg viewBox="0 0 24 24">{g_neon()}</svg></div>
{STARS()}'''

# ---------- 3. Placa "Sua opinião" 150×180 ----------
p3 = f'''
<svg class="p3-bg" viewBox="0 0 150 180" preserveAspectRatio="none">
  <defs><linearGradient id="rb" x1="0" x2="1">
    <stop offset="0" stop-color="#FBBC05"/><stop offset=".22" stop-color="#F57C00"/><stop offset=".42" stop-color="#E91E63"/>
    <stop offset=".62" stop-color="#9C27B0"/><stop offset=".8" stop-color="#3F51B5"/><stop offset="1" stop-color="#2196F3"/></linearGradient></defs>
  <path d="M-10 -10 H160 V88 C120 70 95 96 75 92 C50 87 30 70 -10 86 Z" fill="#0d0d0d"/>
  <path d="M-10 86 C30 70 50 87 75 92 C95 96 120 70 160 88" fill="none" stroke="url(#rb)" stroke-width="7"/>
</svg>
{STARS()}
<div class="p3-title">SUA OPINIÃO É<br>MUITO IMPORTANTE!</div>
<div class="p3-gcircle"><svg viewBox="0 0 24 24">{G_PATHS}</svg></div>
<div class="p3-oval">{TAP}</div>
<div class="p3-cta">Toque para avaliar sua experiência</div>'''

# ---------- 4. Placa quadrada 150×150 ----------
p4 = f'''
<div class="p4-top">AVALIE NOSSA EMPRESA NO</div>
<div class="word p4-g">{WORDMARK}</div>
{STARS()}
<div class="p4-row">
  <div class="p4-circle">{ring4(4)}<div class="p4-in"><div class="p4-lbl">APROXIME SEU<br>CELULAR <b>AQUI</b></div>{TAP}</div></div>
  <div class="p4-div"></div>
  <div class="p4-square">{rect4(4)}<div class="p4-in"><div class="p4-lbl">ESCANEIE<br>O QRCODE</div><div class="qr-tile p4-qr">{QR}</div></div></div>
</div>
<div class="p4-bar"><span style="background:#4285F4"></span><span style="background:#34A853"></span><span style="background:#FBBC05"></span><span style="background:#EA4335"></span></div>'''

# ---------- variações só com NFC (sem QR code) ----------
p1n = p1.split('<div class="p1-bottom">')[0] + f'''<div class="p1-bottom p1n-bottom">
  <div class="p1-nfc">{WAVES}<div class="p1-nfclbl">NFC</div></div>
</div>'''

p4n = f'''
<div class="p4-top">AVALIE NOSSA EMPRESA NO</div>
<div class="word p4-g">{WORDMARK}</div>
{STARS()}
<div class="p4-row">
  <div class="p4-circle p4n-circle">{ring4(4)}<div class="p4-in"><div class="p4-lbl">APROXIME SEU<br>CELULAR <b>AQUI</b></div>{TAP}</div></div>
</div>
<div class="p4-bar"><span style="background:#4285F4"></span><span style="background:#34A853"></span><span style="background:#FBBC05"></span><span style="background:#EA4335"></span></div>'''

# ---------- versões Instagram ----------
IG_STOPS = '<stop offset="0" stop-color="#FEDA75"/><stop offset=".3" stop-color="#FA7E1E"/><stop offset=".55" stop-color="#D62976"/><stop offset=".8" stop-color="#962FBF"/><stop offset="1" stop-color="#4F5BD5"/>'
IG_CSS_GRAD = "linear-gradient(45deg,#FEDA75 0%,#FA7E1E 28%,#D62976 55%,#962FBF 80%,#4F5BD5 100%)"

def ig_ring(stroke, gid):
    return (f'<svg viewBox="0 0 100 100" class="ring4"><defs><linearGradient id="{gid}" x1="0" y1="1" x2="1" y2="0">{IG_STOPS}</linearGradient></defs>'
            f'<circle cx="50" cy="50" r="{50-stroke/2}" fill="none" stroke="url(#{gid})" stroke-width="{stroke}"/></svg>')

def ig_cam(gid, neon=False):
    shapes = ('<rect x="2.5" y="2.5" width="19" height="19" rx="5.5" fill="none" stroke-width="2.2"/>'
              '<circle cx="12" cy="12" r="4.6" fill="none" stroke-width="2.2"/><circle cx="17.4" cy="6.6" r="1.35" stroke="none" fill="url(#%s)"/>' % gid)
    defs = f'<defs><linearGradient id="{gid}" gradientUnits="userSpaceOnUse" x1="2" y1="22" x2="22" y2="2">{IG_STOPS}</linearGradient>'
    if not neon:
        return f'<svg viewBox="0 0 24 24">{defs}</defs><g stroke="url(#{gid})">{shapes}</g></svg>'
    defs += f'<filter id="{gid}f" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.1"/></filter></defs>'
    thin = shapes.replace('stroke-width="2.2"', 'stroke-width=".5"')
    return (f'<svg viewBox="0 0 24 24" style="overflow:visible">{defs}'
            f'<g stroke="url(#{gid})" filter="url(#{gid}f)" opacity=".9">{shapes}</g>'
            f'<g stroke="url(#{gid})" style="filter:drop-shadow(0 0 .25px #fff)">{thin}</g></svg>')

def ig_text(text, gid, w, h, size, y, font="'Grand Hotel',cursive", weight=400, spacing=0):
    # texto com degradê feito em SVG (o background-clip:text deixa um contorno no PDF)
    return (f'<svg class="igtxt" viewBox="0 0 {w} {h}"><defs><linearGradient id="{gid}" gradientUnits="userSpaceOnUse" x1="0" y1="{h}" x2="{w}" y2="0">{IG_STOPS}</linearGradient></defs>'
            f'<text x="{w/2}" y="{y}" text-anchor="middle" font-family="{font}" font-size="{size}" font-weight="{weight}" letter-spacing="{spacing}" fill="url(#{gid})">{text}</text></svg>')

IG_WORD = lambda gid: ig_text("Instagram", gid, 320, 128, 100, 88)

def ig_letters(text):
    # cada letra com uma cor sólida do degradê (degradê em texto pequeno falha no PDF)
    cols = ["#FEDA75", "#FCAF45", "#FA7E1E", "#E95950", "#D62976", "#B42F9E", "#962FBF", "#4F5BD5"]
    pick = lambda i: cols[round(i * (len(cols) - 1) / max(len(text) - 1, 1))]
    spans = "".join(f'<tspan fill="{pick(i)}">{c}</tspan>' for i, c in enumerate(text))
    return (f'<svg class="igtxt" viewBox="0 0 300 40"><text x="150" y="30" text-anchor="middle" font-family="Outfit,sans-serif" '
            f'font-size="32" font-weight="600" letter-spacing="11">{spans}</text></svg>')

def ig_mesa(gid):
    return f'''
<div class="p1-ring">{ig_ring(3.2, gid)}
  <div class="p1-text"><div class="p1-a">Siga-nos</div><div class="p1-no">no</div><div class="p1-igw">{IG_WORD(gid+"w")}</div></div></div>
<div class="p1-bottom p1n-bottom">
  <div class="p1-nfc">{WAVES}<div class="p1-nfclbl">NFC</div></div>
</div>'''

def ig_quadrada(gid):
    return f'''
<div class="p4-top">SIGA NOSSA EMPRESA NO</div>
<div class="ig4-head"><div class="ig4-cam">{ig_cam(gid+"c")}</div><div class="ig4-igw">{IG_WORD(gid+"w")}</div></div>
<div class="p4-row">
  <div class="p4-circle p4n-circle">{ig_ring(4, gid)}<div class="p4-in"><div class="p4-lbl">APROXIME SEU<br>CELULAR <b>AQUI</b></div>{TAP}</div></div>
</div>
<div class="p4-bar ig-bar"></div>'''

ig_cartao = f'''
<div class="p2-notch ig2-notch">{WAVES}</div>
<div class="p2-g ig2-cam">{ig_cam("igneon", neon=True)}</div>
<div class="ig2-txt">{ig_letters("SIGA-NOS")}</div>'''

# ---------- versão WhatsApp ----------
WA_GREEN = "#25D366"
WA_ICON = (f'<svg viewBox="0 0 92 92" fill="none" stroke="{WA_GREEN}" stroke-width="6" stroke-linejoin="round">'
           '<path d="M46 8 a38 38 0 1 1 -21 69.6 L8 84 l6.4 -16.6 A38 38 0 0 1 46 8z"/>'
           f'<path d="M33 27 c-5 3 -5 10 0 17 c6 9 13 15 22 18 c6 2 11 0 13 -5 l-9 -6 l-5 4 c-6 -3 -10 -7 -13 -13 l4 -5 z" fill="{WA_GREEN}" stroke-width="2"/></svg>')

def wa_ring(stroke):
    return (f'<svg viewBox="0 0 100 100" class="ring4"><circle cx="50" cy="50" r="{50-stroke/2}" fill="none" '
            f'stroke="{WA_GREEN}" stroke-width="{stroke}"/></svg>')

wa_quadrada = f'''
<div class="p4-top">CHAME NOSSA EMPRESA NO</div>
<div class="wa4-head"><div class="wa4-icon">{WA_ICON}</div><div class="wa4-word">WhatsApp</div></div>
<div class="p4-row">
  <div class="p4-circle p4n-circle">{wa_ring(4)}<div class="p4-in"><div class="p4-lbl">APROXIME SEU<br>CELULAR <b>AQUI</b></div>{TAP}</div></div>
</div>
<div class="p4-bar wa-bar"></div>'''

# ---------- placa quadrada do Google com o logo da empresa no centro ----------
def logo_quadrada(logo):
    return f'''
<div class="p4-top lg-top">AVALIE NOSSA EMPRESA NO</div>
<div class="word lg-g">{WORDMARK}</div>
{STARS()}
<div class="lg-ring">{ring4(3.4)}<img class="lg-img" src="logos/{logo}.png" alt=""></div>
<div class="lg-cta">{TAP}<div class="lg-lbl">APROXIME SEU<br>CELULAR <b>NO LOGO</b></div></div>
<div class="p4-bar"><span style="background:#4285F4"></span><span style="background:#34A853"></span><span style="background:#FBBC05"></span><span style="background:#EA4335"></span></div>'''

# ---------- mais modelos do WhatsApp ----------
WA_PATHS = ('<path d="M46 8 a38 38 0 1 1 -21 69.6 L8 84 l6.4 -16.6 A38 38 0 0 1 46 8z"/>',
            '<path d="M33 27 c-5 3 -5 10 0 17 c6 9 13 15 22 18 c6 2 11 0 13 -5 l-9 -6 l-5 4 c-6 -3 -10 -7 -13 -13 l4 -5 z"/>')

def wa_neon():
    bubble, phone = WA_PATHS
    glow = (f'<g fill="none" stroke="{WA_GREEN}" stroke-width="7" stroke-linejoin="round" filter="url(#wablur)" opacity=".9">{bubble}{phone}</g>')
    sharp = (f'<g fill="none" stroke="#b9f5cf" stroke-width="2" stroke-linejoin="round">{bubble}{phone}</g>')
    return ('<svg viewBox="0 0 92 92" style="overflow:visible"><defs><filter id="wablur" x="-50%" y="-50%" width="200%" height="200%">'
            '<feGaussianBlur stdDeviation="3.5"/></filter></defs>' + glow +
            f'<g fill="none" stroke="{WA_GREEN}" stroke-width="5" stroke-linejoin="round">{bubble}{phone}</g>' + sharp + '</svg>')

wa_mesa = f"""
<div class="p1-ring">{wa_ring(3.2)}
  <div class="p1-text"><div class="p1-a">Chame-nos</div><div class="p1-no">no</div><div class="wa1-word">WhatsApp</div></div></div>
<div class="p1-bottom p1n-bottom">
  <div class="p1-nfc">{WAVES}<div class="p1-nfclbl">NFC</div></div>
</div>"""

wa_opiniao = f"""
<svg class="p3-bg" viewBox="0 0 150 180" preserveAspectRatio="none">
  <defs><linearGradient id="rbw" x1="0" x2="1">
    <stop offset="0" stop-color="#128C7E"/><stop offset=".5" stop-color="#25D366"/><stop offset="1" stop-color="#128C7E"/></linearGradient></defs>
  <path d="M-10 -10 H160 V88 C120 70 95 96 75 92 C50 87 30 70 -10 86 Z" fill="#0d0d0d"/>
  <path d="M-10 86 C30 70 50 87 75 92 C95 96 120 70 160 88" fill="none" stroke="url(#rbw)" stroke-width="7"/>
</svg>
<div class="wa3-tags">PEDIDOS &nbsp;•&nbsp; ORÇAMENTOS &nbsp;•&nbsp; DÚVIDAS</div>
<div class="p3-title wa3-title">FALE COM A GENTE<br>NO WHATSAPP!</div>
<div class="p3-gcircle wa3-circle">{WA_ICON}</div>
<div class="p3-oval">{TAP}</div>
<div class="p3-cta">Toque e fale com a gente agora</div>"""

wa_cartao = f"""
<div class="p2-notch wa2-notch">{WAVES}</div>
<div class="p2-g wa2-icon">{wa_neon()}</div>
<div class="wa2-txt"><b>CHAME NO WHATSAPP</b><span>e salve nosso contato</span></div>"""

CSS = '''
* { box-sizing:border-box; margin:0; padding:0; }
body { background:#e8e8ea; font-family:"Outfit",system-ui,sans-serif; padding:30px 16px; }
.grid { display:flex; flex-wrap:wrap; gap:36px; justify-content:center; align-items:flex-start; }
figure { display:flex; flex-direction:column; align-items:center; gap:10px; }
figcaption { font:600 13px "Outfit",sans-serif; color:#444; letter-spacing:1px; }
.sheet { position:relative; overflow:hidden; background:#0d0d0d; color:#fff; }
.trim { position:absolute; display:flex; flex-direction:column; align-items:center; text-align:center; }
.guide { position:absolute; border:1px dashed rgba(255,0,0,.5); pointer-events:none; }
body.print .guide { display:none; }
body.print { background:none; padding:0; }
body.print figcaption { display:none; }
.word { font-weight:500; letter-spacing:-.04em; line-height:1; }
.stars { display:flex; justify-content:center; }
.qr-tile { background:#fff; border-radius:2mm; padding:2.2mm; }
.qr-tile svg { display:block; width:100%; height:100%; }
.ring4 { position:absolute; inset:0; width:100%; height:100%; }
.tap { display:block; }
.waves { display:block; }

/* 1 */
.p1 .p1-ring { position:relative; width:78mm; height:78mm; margin-top:12mm; }
.p1-text { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; }
.p1-a { font-size:11mm; font-weight:600; line-height:1; letter-spacing:-.02em; }
.p1-no { font-size:9mm; font-weight:600; line-height:1.1; }
.p1-g { font-size:19mm; margin-top:1mm; }
.p1-bottom { margin-top:auto; margin-bottom:10mm; width:84mm; display:flex; align-items:center; justify-content:space-between; }
.p1-nfc { width:36mm; display:flex; flex-direction:column; align-items:center; color:#fff; }
.p1-nfc .waves { width:26mm; height:26mm; }
.p1-nfclbl { font-size:10mm; font-weight:700; letter-spacing:.02em; margin-top:1mm; }
.p1-qr { width:40mm; height:40mm; }

/* 2 */
.p2 { background:#0b0b0b; }
.p2-notch { margin-top:-3mm; width:34mm; height:13mm; border-radius:0 0 17mm 17mm / 0 0 13mm 13mm; background:#1b1b1b;
            box-shadow:inset 0 -1px 2px rgba(255,255,255,.06), inset 0 2px 4px rgba(0,0,0,.8); display:flex; align-items:center; justify-content:center; color:#4caf50; padding-top:3mm; }
.p2-notch .waves { width:7mm; height:7mm; transform:rotate(-90deg); }
.p2-g { width:38mm; height:38mm; margin-top:14mm; }
.p2-g svg { width:100%; height:100%; overflow:visible; }
.p2 .stars { margin-top:auto; margin-bottom:12mm; gap:.6mm; }
.p2 .stars svg { width:3.6mm; height:3.6mm; }

/* 3 */
.p3 { background:#fff; color:#111; }
.p3-bg { position:absolute; inset:-3mm; width:calc(100% + 6mm); height:calc(100% + 6mm); }
.p3 .stars { position:relative; margin-top:9mm; gap:2mm; }
.p3 .stars svg { width:12mm; height:12mm; }
.p3-title { position:relative; margin-top:3mm; color:#fff; font-size:12.5mm; font-weight:800; line-height:1.05; letter-spacing:-.01em; }
.p3-gcircle { position:relative; margin-top:6mm; width:38mm; height:38mm; border-radius:50%; background:#fff;
              box-shadow:0 1mm 3mm rgba(0,0,0,.25); display:flex; align-items:center; justify-content:center; }
.p3-gcircle svg { width:25mm; height:25mm; }
.p3-oval { position:relative; margin-top:12mm; width:104mm; height:44mm; border:1.3mm solid #111; border-radius:50%;
           display:flex; align-items:center; justify-content:center; gap:4mm; color:#111; }
.p3-oval .waves { width:28mm; height:28mm; }
.p3-oval .tap { width:50mm; height:38mm; }
.p3-cta { position:relative; margin-top:8mm; font-size:8.6mm; font-weight:500; color:#111; }

/* 4 */
.p4-top { margin-top:10mm; font-size:6mm; font-weight:600; letter-spacing:.06em; }
.p4-g { font-size:30mm; margin-top:1mm; }
.p4 .stars { gap:2.5mm; margin-top:2mm; }
.p4 .stars svg { width:11mm; height:11mm; }
.p4-row { margin-top:9mm; display:flex; align-items:center; gap:7mm; }
.p4-circle, .p4-square { position:relative; width:60mm; height:60mm; }
.p4-in { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2mm; }
.p4-lbl { font-size:5mm; font-weight:500; line-height:1.15; letter-spacing:.02em; }
.p4-lbl b { font-weight:800; }
.p4-circle .tap { width:34mm; height:26mm; color:#fff; }
.p4-div { width:.35mm; height:48mm; background:rgba(255,255,255,.45); }
.p4-qr { width:31mm; height:31mm; padding:1.6mm; border-radius:1mm; }
.p4-bar { position:absolute; left:-3mm; right:-3mm; bottom:-3mm; height:11mm; display:flex; }
.p4-bar span { flex:1; }

/* variações só com NFC */
.p1n-bottom { justify-content:center; margin-bottom:13mm; }
.p1n-bottom .p1-nfc { width:auto; }
.p1n-bottom .waves { width:26mm; height:26mm; }
.p1n-bottom .p1-nfclbl { font-size:11mm; }
.p4n-circle { width:64mm; height:64mm; }
.p4n-circle .tap { width:38mm; height:29mm; }

/* versão branca */
.sheet.light { background:#fff; color:#1a1a1a; }
.light .p1-nfc, .light .p4-circle .tap { color:#1a1a1a; }

/* Instagram */
.igtxt { display:block; width:100%; height:100%; overflow:visible; }
.p1-igw { width:54.4mm; height:21.8mm; margin-top:-1mm; }
.ig4-head { display:flex; align-items:center; gap:4mm; margin-top:5mm; }
.ig4-cam svg { width:20mm; height:20mm; display:block; }
.ig4-igw { width:83.2mm; height:33.3mm; }
.ig-bar { background:IGGRAD; }
.ig2-notch { color:#E1306C; }
.ig2-cam { width:32mm; height:32mm; margin-top:17mm; }
.ig2-txt { margin-top:auto; margin-bottom:11mm; width:30mm; height:4mm; }

/* Google com logo da empresa */
.lg-top { margin-top:7mm; font-size:5mm; }
.lg-g { font-size:19mm; margin-top:.5mm; }
.p4 .lg-g + .stars { margin-top:1mm; gap:2mm; }
.p4 .lg-g + .stars svg { width:7.5mm; height:7.5mm; }
.lg-ring { position:relative; width:72mm; height:72mm; margin-top:4mm; }
.lg-img { position:absolute; inset:4mm; width:calc(100% - 8mm); height:calc(100% - 8mm); border-radius:50%; object-fit:cover; }
.lg-cta { display:flex; align-items:center; gap:3mm; margin-top:4mm; }
.lg-cta .tap { width:17mm; height:13mm; color:#fff; }
.lg-lbl { font-size:4.6mm; font-weight:500; line-height:1.15; letter-spacing:.03em; text-align:left; }
.lg-lbl b { font-weight:800; }
/* WhatsApp */
.wa1-word { font-size:12mm; font-weight:700; color:#25D366; letter-spacing:-.02em; line-height:1.1; margin-top:1mm; }
.wa3-tags { position:relative; margin-top:12mm; font-size:4.6mm; font-weight:600; letter-spacing:.12em; color:#25D366; }
.wa3-title { margin-top:3mm; }
.wa3-circle svg { width:26mm; height:26mm; }
.wa2-notch { color:#25D366; }
.wa2-icon { width:32mm; height:32mm; margin-top:17mm; }
.wa2-txt { margin-top:auto; margin-bottom:10mm; display:flex; flex-direction:column; align-items:center; gap:.8mm; }
.wa2-txt b { font-size:3.3mm; font-weight:700; letter-spacing:.14em; color:#25D366; }
.wa2-txt span { font-size:2.9mm; font-weight:400; color:#ddd; letter-spacing:.03em; }

/* WhatsApp com fundo branco */
.light .p3-bg path[fill="#0d0d0d"] { fill:#fff; }
.light .p3-title { color:#1a1a1a; }
.light .wa3-circle { box-shadow:none; border:1.2mm solid #25D366; }  /* sombra vira imagem cinza no PDF */
.light .p2-notch { background:#ececec; box-shadow:inset 0 2px 4px rgba(0,0,0,.18); }
.light .wa2-txt span { color:#555; }
.wa4-head { display:flex; align-items:center; gap:5mm; margin-top:6mm; margin-bottom:2mm; }
.wa4-icon svg { width:24mm; height:24mm; display:block; }
.wa4-word { font-size:21mm; font-weight:700; letter-spacing:-.02em; line-height:1; }
.wa-bar { background:#25D366; }
'''

SYMS = ""
html = f'''<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Placas Google NFC</title>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Grand+Hotel&display=swap" rel="stylesheet">
<style>{CSS.replace('IGGRAD', IG_CSS_GRAD)}</style></head><body>
<div class="grid">
{sheet("placa-mesa", 100, 150, "p1", p1, "1 · DISPLAY DE MESA")}
{sheet("placa-cartao", 54, 85.6, "p2", p2, "2 · CARTÃO G NEON")}
{sheet("placa-opiniao", 150, 180, "p3", p3, "3 · SUA OPINIÃO É IMPORTANTE")}
{sheet("placa-quadrada", 150, 150, "p4", p4, "4 · PLACA QUADRADA")}
{sheet("placa-mesa-nfc", 100, 150, "p1", p1n, "1B · DISPLAY DE MESA SÓ NFC")}
{sheet("placa-quadrada-nfc", 150, 150, "p4", p4n, "4B · PLACA QUADRADA SÓ NFC")}
{sheet("placa-mesa-nfc-branca", 100, 150, "p1 light", p1n, "1C · DISPLAY DE MESA BRANCO")}
{sheet("placa-quadrada-nfc-branca", 150, 150, "p4 light", p4n, "4C · PLACA QUADRADA BRANCA")}
{sheet("ig-mesa-nfc", 100, 150, "p1", ig_mesa("igA"), "IG · DISPLAY DE MESA")}
{sheet("ig-mesa-nfc-branca", 100, 150, "p1 light", ig_mesa("igB"), "IG · DISPLAY DE MESA BRANCO")}
{sheet("ig-quadrada-nfc", 150, 150, "p4", ig_quadrada("igC"), "IG · PLACA QUADRADA")}
{sheet("ig-quadrada-nfc-branca", 150, 150, "p4 light", ig_quadrada("igD"), "IG · PLACA QUADRADA BRANCA")}
{sheet("ig-cartao", 54, 85.6, "p2", ig_cartao, "IG · CARTÃO NEON")}
{sheet("wa-quadrada-nfc", 150, 150, "p4", wa_quadrada, "WA · PLACA QUADRADA")}
{sheet("wa-opiniao", 150, 180, "p3", wa_opiniao, "WA · FALE COM A GENTE")}
{sheet("wa-mesa-nfc", 100, 150, "p1", wa_mesa, "WA · DISPLAY DE MESA")}
{sheet("wa-cartao", 54, 85.6, "p2", wa_cartao, "WA · CARTÃO NEON")}
{sheet("wa-quadrada-nfc-branca", 150, 150, "p4 light", wa_quadrada, "WA · PLACA QUADRADA BRANCA")}
{sheet("wa-opiniao-branca", 150, 180, "p3 light", wa_opiniao, "WA · FALE COM A GENTE BRANCA")}
{sheet("wa-mesa-nfc-branca", 100, 150, "p1 light", wa_mesa, "WA · DISPLAY DE MESA BRANCO")}
{sheet("wa-cartao-branco", 54, 85.6, "p2 light", wa_cartao, "WA · CARTÃO BRANCO")}
{sheet("google-logo-companhia-das-pizzas", 150, 150, "p4", logo_quadrada("companhia-das-pizzas"), "GOOGLE · COMPANHIA DAS PIZZAS")}
{sheet("google-logo-pampa", 150, 150, "p4", logo_quadrada("pampa"), "GOOGLE · PAMPA")}
{sheet("google-logo-yatta", 150, 150, "p4", logo_quadrada("yatta"), "GOOGLE · YATTA")}
</div></body></html>'''

open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "placas.html"), "w").write(html)
print("ok")
