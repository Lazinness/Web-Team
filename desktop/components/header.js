// <site-header current="home"></site-header>
// Атрибут current підсвічує активний пункт меню: home | residents | cabinet | contacts
class SiteHeader extends HTMLElement {
  connectedCallback() {
    const current = this.getAttribute('current');
    const links = [
      { id: 'home',      href: 'main.html',      text: 'Головна' },
      { id: 'residents', href: 'residents.html', text: 'Мешканцям' },
      { id: 'cabinet',   href: 'cabinet.html',   text: 'Особистий кабінет' },
      { id: 'contacts',  href: 'contacts.html',  text: 'Контакти' },
    ];

    const items = links.map(({ id, href, text }) => `
        <li><a href="${href}"${id === current ? ' aria-current="page"' : ''}>${text}</a></li>`
    ).join('');

    this.innerHTML = `
    <div class="top-flex">
        <header class="head-flex">
            <a class="logo" href="main.html">
                <img src="../images/icon_top.svg" alt="">
                <span class="logo-text">Студентський<br>гуртожиток №1</span>
            </a>
        </header>
        <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="main-nav" aria-label="Відкрити меню"><span></span></button>
        <nav id="main-nav" aria-label="Головна навігація">
            <ul>${items}
                <li><button type="button">Увійти</button></li>
            </ul>
        </nav>
    </div>`;

    // Мобільне меню
    const bar = this.querySelector('.top-flex');
    const toggle = this.querySelector('.nav-toggle');
    toggle.addEventListener('click', () => {
      const open = bar.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open);
      toggle.setAttribute('aria-label', open ? 'Закрити меню' : 'Відкрити меню');
    });
  }
}
customElements.define('site-header', SiteHeader);