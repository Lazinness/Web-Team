// <site-footer></site-footer>
class SiteFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
    <footer class="footer">
        <div class="footer-top">
            <div class="footer-brand">
                <p class="footer-title">Студентський<br>гуртожиток №1</p>
                <p>Ваш простір для навчання,<br>відпочинку та нових можливостей.</p>
            </div>
            <nav class="footer-col" aria-label="Навігація у футері">
                <h4>Навігація</h4>
                <ul>
                    <li><a href="index.html">Головна</a></li>
                    <li><a href="residents.html">Мешканцям</a></li>
                    <li><a href="cabinet.html">Особистий кабінет</a></li>
                    <li><a href="contacts.html">Контакти</a></li>
                </ul>
            </nav>
            <div class="footer-col">
                <h4>Київ</h4>
                <ul>
                    <li>Адресу буде уточнено</li>
                    <li>Телефон буде додано</li>
                    <li>Email буде додано</li>
                </ul>
            </div>
        </div>
        <div class="footer-bottom">
            <small>© ${new Date().getFullYear()} Студентський гуртожиток №1</small>
            <a href="privacy.html">Конфіденційність</a>
        </div>
    </footer>`;
  }
}
customElements.define('site-footer', SiteFooter);
