// Форма «Контакти»: власна валідація з повідомленнями українською.

const form = document.querySelector('.contact-form');

if (form) {
    form.noValidate = true; // вимикаємо вбудовані підказки браузера — показуємо свої

    // правила: повертають текст помилки або '' якщо все гаразд
    const rules = {
        name:    v => v.trim().length >= 2 ? '' : 'Введіть ім’я (щонайменше 2 символи).',
        email:   v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Введіть коректну електронну адресу.',
        topic:   v => v ? '' : 'Оберіть тему звернення.',
        message: v => v.trim().length >= 10 ? '' : 'Опишіть питання (щонайменше 10 символів).',
        consent: (v, field) => field.checked ? '' : 'Потрібна згода на обробку даних.'
    };

    function setError(field, message) {
        const holder = field.closest('.field') || field.closest('label');
        let error = document.getElementById(`${field.name}-error`);

        if (!error) {
            error = document.createElement('p');
            error.className = 'field-error';
            error.id = `${field.name}-error`;
            error.setAttribute('role', 'alert');
            // для чекбокса помилка стає після <label>, для решти — всередині .field
            if (holder.matches('label')) holder.after(error); else holder.append(error);
            field.setAttribute('aria-describedby', error.id);
        }
        error.textContent = message;
        field.classList.toggle('is-invalid', Boolean(message));
        field.setAttribute('aria-invalid', message ? 'true' : 'false');
    }

    function validate(field) {
        const rule = rules[field.name];
        if (!rule) return true; // поле без правил (номер кімнати)
        const message = rule(field.value, field);
        setError(field, message);
        return !message;
    }

    // перевірка при виході з поля; якщо помилка вже показана — оновлюємо під час введення
    form.addEventListener('focusout', e => {
        if (e.target.name in rules) validate(e.target);
    });
    form.addEventListener('input', e => {
        if (e.target.classList.contains('is-invalid')) validate(e.target);
    });
    form.addEventListener('change', e => {
        if (e.target.name in rules) validate(e.target); // select і чекбокс
    });

    form.addEventListener('submit', e => {
        e.preventDefault();

        const invalid = [...form.elements].filter(f => f.name && !validate(f));
        if (invalid.length) {
            invalid[0].focus();
            return;
        }

        // типу відправка на сервер (fetch POST), але поки що демо
        const success = document.createElement('p');
        success.className = 'form-success';
        success.setAttribute('role', 'status');
        success.textContent = `Дякуємо, ${form.elements.name.value.trim()}! Повідомлення надіслано. Відповідь прийде на ${form.elements.email.value.trim()}.`;

        form.hidden = true;
        form.after(success);
    });
}