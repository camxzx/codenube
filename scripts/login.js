document.addEventListener('DOMContentLoaded', function() {
    const showRegisterFormButton = document.getElementById('showRegisterForm');
    const showLoginFormButton = document.getElementById('showLoginForm');
    const loginContainer = document.getElementById('loginContainer');
    const registerContainer = document.getElementById('registerContainer');

    // Muestra el formulario de registro y oculta el de inicio de sesión
    showRegisterFormButton.addEventListener('click', function() {
        loginContainer.classList.add('hidden');
        registerContainer.classList.remove('hidden');
    });

    // Muestra el formulario de inicio de sesión y oculta el de registro
    showLoginFormButton.addEventListener('click', function() {
        registerContainer.classList.add('hidden');
        loginContainer.classList.remove('hidden');
    });
});

// Manejar el registro de usuarios
document.getElementById('registerForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const nombre = document.getElementById('registerNombre').value;
    const email = document.getElementById('registerCorreo').value;
    const contrasena = document.getElementById('registerPassword').value;

    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nombre, email, contrasena }),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Error: ${error}`);
        }

        const data = await response.text();
        console.log(data); // Mensaje de éxito
        alert('Usuario registrado exitosamente');

        // Redirigir al formulario de inicio de sesión
        document.getElementById('registerContainer').classList.add('hidden');
        document.getElementById('loginContainer').classList.remove('hidden'); // Mostrar el formulario de inicio de sesión

    } catch (error) {
        console.error('Error al agregar usuario:', error.message);
        alert('Error al registrar el usuario');
    }
});

// Manejar el inicio de sesión y redirigir a otra página
document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.getElementById('loginCorreo').value;
    const contrasena = document.getElementById('loginPassword').value;

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, contrasena }),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Error: ${error}`);
        }

        const data = await response.text(); // Aquí recibimos el mensaje de éxito
        console.log(data); // Mensaje de éxito en el login
        alert('Login exitoso');

        // Redirigir a otra página (por ejemplo, home.html)
        window.location.href = '/html/index.html'; // Cambia 'home.html' por la página que desees
    } catch (error) {
        console.error('Error en el login:', error.message);
        alert('Error en el login: ' + error.message);
    }
});