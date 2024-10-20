const button_toggle = document.querySelector('button');
const navBar = document.querySelector('nav');
const form = document.querySelector('form');
const eyes = document.querySelector('.show-password');
const eyes_img = document.querySelector('.show-password>img');
const inputPassword = document.querySelector('input[type=password]');
const button_loading = document.querySelector('.btn-submit');
const button_cancel = document.querySelector('.btn-reset');
let showPassword = false;
let controller = new AbortController();
let signal = controller.signal;

class CheckError {
    validarEmail(email) {
        const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return regex.test(email);
    }
    email(email) {
        if (email.trim().length === 0 || !this.validarEmail(email)) {
            throw new Error('Email Invalido!')
        }
    }
    password(password) {
        if (password.trim().length === 0) {
            throw new Error('Senha invalida');
        }
        if (password.trim().length < 8) {
            throw new Error('Senha muito curta, tem que ter 8 caracteres');
        }
    }
    verify(datasUser) {
        this.email(datasUser.email);
        this.password(datasUser.password);
    }
}

button_toggle.onclick = () => navBar.classList.toggle('show');
eyes.onclick = () => showPasswordUser(showPassword = !showPassword);
form.onsubmit = async (event) => {
    try {
        loadingBtn(true);
        const checkError = new CheckError();
        event.preventDefault();
        const formData = new FormData(event.target);
        const datasUser = Object.fromEntries(formData.entries());
        checkError.verify(datasUser);
        await connectionServer(datasUser);
    } catch (error) {
        alert(error.message);
    } finally {
        loadingBtn(false);
    }
}

button_cancel.onclick = () => {
    controller.abort();
    controller = new AbortController();
    signal = controller.signal;
    form.reset();
}

function loadingBtn(value) {
    button_loading.textContent = value ? 'carregando...' : 'enviar';
    
}

function showPasswordUser(value) {
    const config = {
        type: ['text', 'password'],
        source: (value) => `${location.origin}/src/images/${value}.svg`
    }
    inputPassword.type = value ? config.type[0] : config.type[1];
    eyes_img.src = config.source(value ? 'show' : 'hide');
}

async function connectionServer({ email, password }) {
    try {
        const request = await fetch(
            'https://login-user-q30w.onrender.com/login',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
                signal
            }
        );
        const json = await request.json();
        if (!request.ok) throw new Error(json.error);
        return json;
    } catch (error) {
        if (error.name === 'AbortError') {
            console.log('Requisição abortada.');
        } else {
            throw new Error(error.message || 'Erro ao se conectar com o servidor');
        }
    }
}

