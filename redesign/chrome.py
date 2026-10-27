# Gives the reading pages (about, privacy, team) the site's header, its tool dock and the wordmark in the footer.
import re, sys, os
root = sys.argv[1]
L = {
 'en': dict(home='VibeFounder, home', company='Company', about='About', team='Team', privacy='Privacy', main='Main', skip='Skip to the page',
            dock=['Bench', '<span class="dock__long">Missing </span>half', 'Proof', '<span class="dock__long">The </span>deal', 'Startups'], app='app/'),
 'es': dict(home='VibeFounder, inicio', company='Empresa', about='Quiénes somos', team='Equipo', privacy='Privacidad', main='Principal', skip='Saltar a la página',
            dock=['Banco', 'Mitad<span class="dock__long"> que falta</span>', 'Pruebas', '<span class="dock__long">El </span>acuerdo', 'Startups'], app='../app/?lang=es'),
 'zh': dict(home='VibeFounder，首页', company='公司', about='关于', team='团队', privacy='隐私', main='主导航', skip='跳到正文',
            dock=['创始席', '另一半', '作品', '协议', '公司'], app='../app/?lang=zh'),
}
pages = ['about.html', 'privacy.html', 'team.html', 'team-ivana-petrovic.html', 'team-grace-achieng.html', 'es/about.html', 'es/privacy.html', 'zh/about.html', 'zh/privacy.html']
BRAND = re.compile(r'<a class="brand" href="([^"]*)"( aria-label="[^"]*")?>\s*<svg viewBox="0 0 32 32".*?</svg>\s*<span>VibeFounder</span>\s*</a>', re.S)
for page in pages:
    loc = page.split('/')[0] if '/' in page else 'en'
    up = '../' if '/' in page else ''
    w = L[loc]
    s = open(f'{root}/{page}').read()
    hint = re.search(r'<p id="lang-hint"[^>]*><a href="([^"]*)"></a></p>', s).group(1)
    name = os.path.basename(page)
    cur = lambda target: ' aria-current="page"' if name == target or (target == 'team.html' and name.startswith('team')) else ''
    team = f'{up}team.html'
    dock = [w['app'], f'{up or "./"}#half'.replace('./#', 'index.html#') if not up else '../#half', None, None, None]
    home = './' if up else 'index.html'
    if up: home = './'
    anchors = ['#half', '#proof', '#agreement', '#ecosystem']
    homeurl = './' if up else './'
    links = [w['app']] + [f'{homeurl}{a}' for a in anchors]
    header = f'''<a class="skip" href="#main">{w['skip']}</a>
<header class="site-header">
  <a class="brand" href="./" aria-label="{w['home']}"><img src="{up}brand/wordmark.svg" alt="" width="240" height="33"></a>
  <nav class="site-header__links" aria-label="{w['company']}">
    <a href="about.html"{cur('about.html')}>{w['about']}</a>
    <a href="{team}"{cur('team.html')}>{w['team']}</a>
    <a class="site-header__extra" href="privacy.html"{cur('privacy.html')}>{w['privacy']}</a>
  </nav>
  <p id="lang-hint" class="hint" hidden><a href="{hint}"></a></p>
</header>

<nav class="dock" aria-label="{w['main']}">
''' + '\n'.join(f'  <a{" class=\"dock__primary\"" if i == 0 else ""} href="{href}"><kbd>{i + 1}</kbd>{label}</a>' for i, (href, label) in enumerate(zip(links, w['dock']))) + '\n</nav>'
    s = re.sub(r'<header class="site-header">.*?</header>', lambda m: header, s, count=1, flags=re.S)
    s = BRAND.sub(lambda m: f'<a class="brand" href="./" aria-label="{w["home"]}"><img src="{up}brand/wordmark.svg" alt="" width="240" height="33"></a>', s)
    s = s.replace('<meta name="theme-color" content="#fcfbf7">', '<meta name="theme-color" content="#f2e9da">')
    if 'brand/favicon.svg' not in s:
        s = s.replace(f'<link rel="stylesheet" href="{up}style.css">', f'<link rel="icon" href="{up}brand/favicon.svg" type="image/svg+xml">\n<link rel="apple-touch-icon" href="{up}brand/touch-icon.png">\n<link rel="stylesheet" href="{up}style.css">')
    if '<main>' in s: s = s.replace('<main>', '<main id="main">', 1)
    open(f'{root}/{page}', 'w').write(s)
    print(page, 'ok')
