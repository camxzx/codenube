const express = require('express');
const cors = require('cors');
const sql = require('mssql');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const config = {
    user: 'adminnube',
    password: 'Ust2024.',
    server: 'servenube.database.windows.net',
    database: 'bdnube',
    options: {
        encrypt: true,
        trustServerCertificate: false
    },
};

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta para servir la página principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/html/login.html'));
});

// Servir archivos estáticos (CSS y JS)
app.use(express.static(path.join(__dirname))); // Asegúrate de que el CSS y JS están en la misma carpeta

// Conectar a la base de datos
sql.connect(config).then(pool => {
    console.log('Conectado a la base de datos');

    // Endpoint para registro
    app.post('/register', async (req, res) => {
        const { nombre, email, contrasena } = req.body;

        if (!nombre || !email || !contrasena) {
            return res.status(400).send('Faltan datos requeridos: nombre, email y contraseña');
        }

        try {
            const request = new sql.Request();
            request.input('nombre', sql.NVarChar, nombre);
            request.input('email', sql.NVarChar, email);
            request.input('contraseña', sql.NVarChar, contrasena);

            await request.query('INSERT INTO dbo.usuarios (nombre, email, contraseña) VALUES (@nombre, @email, @contraseña)');

            res.status(201).send('Usuario registrado exitosamente');
        } catch (error) {
            console.error('Error al agregar usuario:', error);
            res.status(500).send('Error al agregar el usuario en la base de datos: ' + error.message);
        }
    });

    // Endpoint para login
    app.post('/login', async (req, res) => {
        const { email, contrasena } = req.body;

        if (!email || !contrasena) {
            return res.status(400).send('Faltan datos requeridos: email y contraseña');
        }

        try {
            const request = new sql.Request();
            request.input('email', sql.NVarChar, email);
            const result = await request.query('SELECT * FROM dbo.usuarios WHERE email = @email');

            if (result.recordset.length === 0) {
                return res.status(401).send('Usuario no encontrado');
            }

            const user = result.recordset[0];

            if (user.contraseña !== contrasena) {
                return res.status(401).send('Contraseña incorrecta');
            }

            res.status(200).send('Login exitoso');
        } catch (error) {
            console.error('Error en el login:', error);
            res.status(500).send('Error en el login: ' + error.message);
        }
    });

    // Rutas CRUD para items
    app.get('/items', async (req, res) => {
        try {
            const request = new sql.Request();
            const result = await request.query('SELECT * FROM dbo.items');
            res.json(result.recordset);
        } catch (error) {
            console.error('Error al obtener items:', error);
            res.status(500).send('Error al obtener los items');
        }
    });

    // Endpoint para obtener un item específico por ID
    app.get('/items/:id', async (req, res) => {
        const id = parseInt(req.params.id);

        try {
            const request = new sql.Request();
            request.input('id', sql.Int, id);
            const result = await request.query('SELECT * FROM dbo.items WHERE ItemID = @id');

            if (result.recordset.length === 0) {
                return res.status(404).send('Item no encontrado');
            }

            res.json(result.recordset[0]);
        } catch (error) {
            console.error('Error al obtener item:', error);
            res.status(500).send('Error al obtener el item de la base de datos: ' + error.message);
        }
    });

    app.post('/items', async (req, res) => {
        const { nombre, descripcion } = req.body;

        if (!nombre || !descripcion) {
            return res.status(400).send('Faltan datos requeridos: nombre y descripción');
        }

        try {
            const request = new sql.Request();
            request.input('nombre', sql.NVarChar, nombre);
            request.input('descripcion', sql.NVarChar, descripcion);

            await request.query('INSERT INTO dbo.items (Nombre, Descripcion) VALUES (@nombre, @descripcion)');

            res.status(201).send('Item agregado exitosamente');
        } catch (error) {
            console.error('Error al agregar item:', error);
            res.status(500).send('Error al agregar el item en la base de datos: ' + error.message);
        }
    });

    app.put('/items/:id', async (req, res) => {
        const id = parseInt(req.params.id);
        const { nombre, descripcion } = req.body;

        if (!nombre || !descripcion) {
            return res.status(400).send('Faltan datos requeridos: nombre y descripción');
        }

        try {
            const request = new sql.Request();
            request.input('id', sql.Int, id);
            request.input('nombre', sql.NVarChar, nombre);
            request.input('descripcion', sql.NVarChar, descripcion);

            await request.query('UPDATE dbo.items SET Nombre = @nombre, Descripcion = @descripcion WHERE ItemID = @id');

            res.status(200).send('Item actualizado exitosamente');
        } catch (error) {
            console.error('Error al actualizar item:', error);
            res.status(500).send('Error al actualizar el item en la base de datos: ' + error.message);
        }
    });

    app.delete('/items/:id', async (req, res) => {
        const id = parseInt(req.params.id);

        try {
            const request = new sql.Request();
            request.input('id', sql.Int, id);

            await request.query('DELETE FROM dbo.items WHERE ItemID = @id');

            res.status(200).send('Item eliminado exitosamente');
        } catch (error) {
            console.error('Error al eliminar item:', error);
            res.status(500).send('Error al eliminar el item en la base de datos: ' + error.message);
        }
    });
});

app.listen(PORT, () => {
    console.log(`Servidor iniciado en el puerto ${PORT}`);
});