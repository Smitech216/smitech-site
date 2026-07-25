from pathlib import Path
import re
root = Path('.')
footer = '''<footer class="site-footer">
  <div class="wrap">
    <div class="foot-grid">
      <div class="foot-brand">
        <a href="index.html" class="logo"><img src="assets/logo.png" alt="Logo SMITECH">SMITECH</a>
        <p>Digital, Software, AI, Cloud &amp; Cybersecurity, Labs et Cabinet Juridique — six filières, une seule ambition.</p>
      </div>
      <div class="foot-col">
        <h5>Entreprise</h5>
        <a href="about.html">À propos</a>
        <a href="filieres.html">Nos filières</a>
        <a href="services.html">Nos services</a>
        <a href="projets.html">Nos projets</a>
        <a href="siege.html">Notre siège</a>
        <a href="actualites.html">Actualités</a>
      </div>
      <div class="foot-col">
        <h5>Rejoindre SMITECH</h5>
        <a href="carrieres.html">Carrières</a>
        <a href="offres.html">Offres d'emploi</a>
      </div>
      <div class="foot-contact">
        <h5>Contact</h5>
        <strong>contact@smitech.fr</strong>
        <a href="mailto:contact@smitech.fr">Envoyer un email</a>
        <a href="contact.html">Formulaire de contact</a>
      </div>
    </div>
    <div class="foot-bottom">
      <div class="foot-bottom-left">
        <div class="foot-copy">© 2026 SMITECH — Tous droits réservés.</div>
        <div class="foot-legal">
          <a href="mentions-legales.html">Mentions légales</a>
          <a href="confidentialite.html">Politique de confidentialité</a>
          <a href="cookies.html">Gestion des cookies</a>
        </div>
      </div>
      <div class="foot-social">
        <a href="#" aria-label="LinkedIn" target="_blank" rel="noopener">in</a>
        <a href="#" aria-label="GitHub" target="_blank" rel="noopener">gh</a>
        <a href="#" aria-label="X" target="_blank" rel="noopener">X</a>
      </div>
    </div>
  </div>
</footer>'''
chatbot = '''
<!-- SmiBot — assistant virtuel -->
<div class="chatbot-container">
  <button class="chatbot-trigger" id="chatTrigger" aria-label="Discuter avec SmiBot">
    <div class="smibot-launcher">
      <div class="smibot-robot">
        <div class="smibot-antenna"><div class="smibot-antenna-tip"></div></div>
        <div class="smibot-head"><div class="smibot-eyes"><div class="smibot-eye left"></div><div class="smibot-eye right"></div></div></div>
        <div class="smibot-body"><div class="smibot-screen"><div class="smibot-pulse-line"></div></div></div>
      </div>
      <div class="smibot-shadow"></div>
      <span class="smibot-tooltip">SmiBot</span>
    </div>
  </button>
  <div class="chatbot-window" id="chatWindow">
    <div class="chatbot-header">
      <div class="chatbot-profile">
        <div class="chatbot-avatar">S</div>
        <div><h4>SmiBot</h4><span class="chatbot-status">En ligne</span></div>
      </div>
      <button class="chatbot-close" id="chatClose" aria-label="Fermer SmiBot">×</button>
    </div>
    <div class="chatbot-search">
      <input id="chatSearch" type="search" placeholder="Rechercher dans SmiBot..." aria-label="Rechercher dans le chatbot">
    </div>
    <div class="chatbot-messages" id="chatMessages"></div>
    <div class="chatbot-footer">
      <div class="chatbot-suggestions" id="chatSuggestions"></div>
      <div class="chatbot-options-wrapper" id="chatOptions"></div>
    </div>
  </div>
</div>'''
footer_pattern = re.compile(r'<footer class="site-footer">.*?</footer>', re.S)
updated = []
for file in sorted(root.glob('*.html')):
    text = file.read_text(encoding='utf-8')
    new = text
    if footer_pattern.search(new):
        new = footer_pattern.sub(footer, new)
    if 'chatbot-container' not in new and '</body>' in new:
        new = new.replace('</body>', chatbot + '\n</body>')
    if new != text:
        file.write_text(new, encoding='utf-8')
        updated.append(file.name)
print('updated:', updated)
