// Особистий кабінет: дані з JSON, сповіщення, нова заявка.


const KEY_READ = 'cabinet-read';        // id прочитаних сповіщень
const KEY_REQUESTS = 'cabinet-requests'; // заявки, створені користувачем

// ---------- допоміжні функції ----------
const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text; // textContent — без ризику XSS
    return node;
};

const load = (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
};
const save = (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ігноруємо */ }
};

const formatDate = iso => new Date(iso).toLocaleDateString('uk-UA'); // 08.10.2026

// «2 нові», «1 нове», «5 нових»
const newWord = n => {
    const m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return 'нове';
    if (m10 >= 2 && m10 <= 4 && !(m100 >= 12 && m100 <= 14)) return 'нові';
    return 'нових';
};

let data;
let readIds = load(KEY_READ, []);
let userRequests = load(KEY_REQUESTS, []);

//  завантаження 
async function init() {
    try {
        const res = await fetch('../data/cabinet.json');
        if (!res.ok) throw new Error(res.status);
        data = await res.json();
    } catch (err) {
        document.querySelector('.cab-head').after(
            el('p', 'demo-note', 'Не вдалося завантажити дані кабінету. Відкрийте сайт через сервер (Live Server) або GitHub Pages.')
        );
        return;
    }
    renderPayments();
    renderRequests();
    renderNotifications();
    initRequestDialog();
}

//  платежі 
function renderPayments() {
    const tbody = document.querySelector('.pay-table tbody');
    const rows = data.payments.map(p => {
        const tr = el('tr');
        const th = el('th', '', p.period);
        th.scope = 'row';
        const amount = el('td');
        amount.append(el('b', '', `${p.amount.toLocaleString('uk-UA')} ₴`));
        tr.append(th, amount, el('td', '', p.date), el('td', `st st--${p.status}`, p.statusText));
        return tr;
    });
    tbody.replaceChildren(...rows);
}

//  заявки 
function requestItem(r) {
    const li = el('li');
    li.append(
        el('b', '', r.title),
        el('small', '', `№ ${String(r.number).padStart(3, '0')} · ${formatDate(r.date)} · ${r.place}`),
        el('span', `st st--${r.status}`, r.statusText)
    );
    return li;
}

function renderRequests() {
    const list = document.querySelector('.req-list');
    const all = [...userRequests, ...data.requests]; // нові зверху
    list.replaceChildren(...all.map(requestItem));
}

function initRequestDialog() {
    const openBtn = document.querySelector('#requests .btn');
    if (!openBtn) return;

    // модальне вікно створюється в DOM скриптом
    const dialog = el('dialog', 'dialog');
    dialog.innerHTML = `
        <form class="dialog-form" novalidate>
            <h2>Нова заявка</h2>
            <label for="req-title">Що сталося? *</label>
            <input id="req-title" name="title" type="text" placeholder="Наприклад: не працює розетка">
            <p class="field-error" id="req-title-error" role="alert"></p>
            <label for="req-place">Місце</label>
            <select id="req-place" name="place">
                <option>кімната 308</option>
                <option>кухня</option>
                <option>коридор</option>
                <option>інше</option>
            </select>
            <div class="dialog-actions">
                <button type="button" class="btn-outline" data-close>Скасувати</button>
                <button type="submit" class="btn">Надіслати</button>
            </div>
        </form>`;
    document.body.append(dialog);

    const form = dialog.querySelector('form');
    const title = form.elements.title;
    const error = dialog.querySelector('.field-error');

    openBtn.addEventListener('click', () => dialog.showModal());
    dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); }); // клік по фону
    dialog.addEventListener('close', () => { form.reset(); error.textContent = ''; title.classList.remove('is-invalid'); });

    form.addEventListener('submit', e => {
        e.preventDefault();
        if (title.value.trim().length < 5) {
            error.textContent = 'Опишіть проблему (щонайменше 5 символів).';
            title.classList.add('is-invalid');
            title.focus();
            return;
        }
        const allNumbers = [...userRequests, ...data.requests].map(r => r.number);
        userRequests.unshift({
            number: Math.max(...allNumbers) + 1,
            title: title.value.trim(),
            date: new Date().toISOString().slice(0, 10),
            place: form.elements.place.value,
            status: 'wait',
            statusText: 'Нова'
        });
        save(KEY_REQUESTS, userRequests);
        renderRequests();
        dialog.close();
    });
}

//  сповіщення 
function renderNotifications() {
    const box = document.querySelector('.notice-list');
    const unread = data.notifications.filter(n => !n.read && !readIds.includes(n.id)).length;

    document.querySelector('#notifications h2').textContent =
        unread ? `Сповіщення · ${unread} ${newWord(unread)}` : 'Сповіщення';

    const items = data.notifications.map(n => {
        const isNew = !n.read && !readIds.includes(n.id);
        const article = el('article');

        const time = el('time', '', formatDate(n.date));
        time.dateTime = n.date;
        article.append(time);
        if (isNew) article.append(' · ', el('span', 'new', 'Нове'));

        article.append(el('h3', '', n.title), el('p', '', n.text));

        if (isNew) {
            const btn = el('button', 'link-btn', 'Позначити прочитаним');
            btn.type = 'button';
            btn.dataset.read = n.id;
            article.append(btn);
        }
        return article;
    });
    box.replaceChildren(...items);
}

// одна подія на весь список (делегування)
document.querySelector('.notice-list')?.addEventListener('click', e => {
    const btn = e.target.closest('[data-read]');
    if (!btn) return;
    readIds.push(Number(btn.dataset.read));
    save(KEY_READ, readIds);
    renderNotifications();
});

init();