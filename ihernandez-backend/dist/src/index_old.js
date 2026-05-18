"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const pg_1 = require("pg");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const JWT_SECRET = process.env.JWT_SECRET ?? "micontraseña";
dotenv_1.default.config();
const pool = new pg_1.Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT ?? "5432"),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: { rejectUnauthorized: false },
});
const app = (0, express_1.default)();
const PORT = 3000;
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({
    origin: true,
    credentials: true,
}));
app.use(express_1.default.json());
const initDb = async () => {
    try {
        console.log("✅ Base de datos despedidas de soltero inicializada");
    }
    catch (error) {
        console.error("Error al inicializar la base de datos:", error);
        throw error;
    }
};
const verifyToken = (req, res, next) => {
    let token;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
    }
    if (!token && req.cookies?.token) {
        token = req.cookies.token;
    }
    if (!token) {
        return res.status(401).json({ error: "Token no proporcionado" });
    }
    try {
        const payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.customer = { id: payload.id, username: payload.username, role: payload.role };
        next();
    }
    catch (error) {
        return res.status(401).json({ error: "Token inválido o expirado" });
    }
};
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.customer) {
            return res.status(401).json({ error: "Usuario no autenticado" });
        }
        if (!roles.includes(req.customer.role)) {
            return res.status(403).json({ error: "No tienes permisos para acceder a este recurso" });
        }
        next();
    };
};
initDb()
    .then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Servidor en http://localhost:${PORT}`);
    });
})
    .catch(() => {
    console.error("No se pudo arrancar el servidor porque no se pudo inicializar la base de datos.");
    process.exit(1);
});
/* ================= PRODUCTS ================= */
app.get("/api/products", async (_req, res) => {
    const result = await pool.query(`
        SELECT 
            p.*,
            COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0) AS "avgRating"
        FROM products p
        LEFT JOIN reviews r ON r.product_id = p.id
        WHERE p.deleted_at IS NULL
        GROUP BY p.id
        ORDER BY p.id
    `);
    res.json(result.rows);
});
/* ================= PRODUCT BY ID ================= */
app.get("/api/products/:id", async (req, res) => {
    const id = Number(req.params.id);
    if (!id || isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
    }
    const result = await pool.query(`
        SELECT 
            p.*,
            COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0) AS "avgRating"
        FROM products p
        LEFT JOIN reviews r ON r.product_id = p.id
        WHERE p.id = $1 AND p.deleted_at IS NULL
        GROUP BY p.id
    `, [id]);
    if (result.rows.length === 0) {
        return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.json(result.rows[0]);
});
app.put("/api/products/:id", verifyToken, requireRole(["admin"]), async (req, res) => {
    const id = Number(req.params.id);
    const { stock } = req.body;
    if (!id || isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
    }
    if (stock == null || isNaN(Number(stock))) {
        return res.status(400).json({ error: "Stock inválido" });
    }
    try {
        const result = await pool.query(`UPDATE products SET stock = $1 WHERE id = $2 RETURNING *`, [Number(stock), id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }
        res.json(result.rows[0]);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || "Error al actualizar el producto" });
    }
});
app.delete("/api/products/:id", verifyToken, requireRole(["admin"]), async (req, res) => {
    const id = Number(req.params.id);
    if (!id || isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
    }
    try {
        const result = await pool.query(`UPDATE products SET deleted_at = NOW() WHERE id = $1 RETURNING *`, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }
        res.json({ message: "Producto eliminado" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || "Error al eliminar el producto" });
    }
});
/* ================= GET REVIEWS ================= */
app.get("/api/products/:id/reviews", async (req, res) => {
    const id = Number(req.params.id);
    if (!id || isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
    }
    const result = await pool.query(`
        SELECT 
            r.id,
            r.rating,
            r.comment,
            COALESCE(c.full_name, 'Anónimo') AS customer
        FROM reviews r
        LEFT JOIN customers c ON c.id = r.customer_id
        WHERE r.product_id = $1
        ORDER BY r.id DESC
    `, [id]);
    res.json(result.rows);
});
const sendAuthCookie = (res, token) => {
    res.cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000,
        path: "/",
    });
};
const buildUser = (user) => ({
    id: user.id,
    username: user.username,
    email: user.email,
    name: user.full_name,
    role: user.role ?? "customer",
});
const loginHandler = async (req, res) => {
    try {
        const { identifier, email, password } = req.body;
        const loginEmail = identifier || email;
        if (!loginEmail || !password) {
            return res.status(400).json({ error: "Email y contraseña son obligatorios" });
        }
        const result = await pool.query("SELECT * FROM customers WHERE email = $1", [loginEmail]);
        const user = result.rows[0];
        if (!user) {
            return res.status(401).json({ error: "Usuario no encontrado" });
        }
        const passwordMatches = await bcrypt_1.default.compare(password, user.password_hash);
        const passwordValid = passwordMatches || password === user.password_hash;
        if (!passwordValid) {
            return res.status(401).json({ error: "Contraseña incorrecta" });
        }
        const role = user.role ?? "customer";
        const token = jsonwebtoken_1.default.sign({
            id: user.id,
            username: user.username,
            role,
        }, JWT_SECRET, { expiresIn: "1d" });
        sendAuthCookie(res, token);
        res.json({
            message: "Login correcto",
            user: buildUser(user),
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};
app.post("/api/login", loginHandler);
app.post("/api/auth/login", loginHandler);
app.post("/api/auth/logout", (_req, res) => {
    res.clearCookie("token", { path: "/" });
    res.json({ message: "Sesión cerrada" });
});
app.get("/api/auth/me", verifyToken, async (req, res) => {
    if (!req.customer) {
        return res.status(401).json({ error: "Usuario no autenticado" });
    }
    try {
        const result = await pool.query("SELECT id, email, full_name, username, role FROM customers WHERE id = $1", [req.customer.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }
        const user = result.rows[0];
        res.json({
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                name: user.full_name,
                role: user.role ?? "customer",
            },
        });
    }
    catch (error) {
        console.error("Error fetching authenticated user:", error);
        res.status(500).json({ error: "Error al obtener información del usuario" });
    }
});
/* ================= POST REVIEW (FIX DUPLICADOS) ================= */
app.post("/api/products/:id/reviews", async (req, res) => {
    const id = Number(req.params.id);
    const { rating, comment, customerId } = req.body;
    if (!id || isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
    }
    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
        return res.status(400).json({ error: "Rating debe ser entre 1 y 5" });
    }
    try {
        const result = await pool.query(`
            INSERT INTO reviews (product_id, customer_id, rating, comment)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (product_id, customer_id)
            DO UPDATE SET rating = EXCLUDED.rating, comment = EXCLUDED.comment
            RETURNING *
        `, [
            id,
            customerId ?? 1,
            numRating,
            comment ?? ""
        ]);
        res.status(201).json(result.rows[0]);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});
app.get("/api/test-db", async (_req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");
        res.json(result.rows);
    }
    catch (error) {
        console.error(error);
        res.status(500).json(error);
    }
});
app.get("/api/debug-full-db", async (_req, res) => {
    try {
        const db = await pool.query("SELECT current_database()");
        const tables = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        res.json({
            database: db.rows[0],
            tables: tables.rows
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
});
const buildUserRow = (user) => ({
    id: user.id,
    email: user.email,
    name: user.full_name,
    role: user.role ?? "customer",
    username: user.username,
});
app.get("/api/users", verifyToken, requireRole(["admin"]), async (_req, res) => {
    try {
        const result = await pool.query("SELECT id, email, full_name, username, role FROM customers");
        res.json(result.rows.map(buildUserRow));
    }
    catch (error) {
        console.error("🔥 ERROR REAL:", error);
        res.status(500).json({
            message: error.message,
            code: error.code,
            detail: error.detail
        });
    }
});
app.get("/api/customers", verifyToken, requireRole(["admin"]), async (_req, res) => {
    try {
        const result = await pool.query("SELECT id, email, full_name, username, role FROM customers");
        res.json(result.rows.map(buildUserRow));
    }
    catch (error) {
        console.error("🔥 ERROR REAL:", error);
        res.status(500).json({
            message: error.message,
            code: error.code,
            detail: error.detail
        });
    }
});
app.post("/api/register", async (req, res) => {
    try {
        const { email, password, name } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Email y contraseña son obligatorios" });
        }
        const saltRounds = 10;
        const hashedPassword = await bcrypt_1.default.hash(password, saltRounds);
        const query = `
            INSERT INTO customers (email, password_hash, full_name, username, role)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, email, full_name, username, role
        `;
        const username = email.split("@")[0]; // fallback simple
        const values = [
            email,
            hashedPassword,
            name || "Usuario",
            username,
            "customer"
        ];
        const result = await pool.query(query, values);
        res.status(201).json({
            message: "Usuario registrado con éxito",
            user: result.rows[0]
        });
    }
    catch (error) {
        console.error("Error al registrar usuario:", error);
        if (error.code === "23505") {
            return res.status(400).json({ error: "El email o username ya existe" });
        }
        const message = error?.detail || error?.message || "Error al registrar el usuario en la base de datos";
        return res.status(500).json({ error: message });
    }
});
app.post("/api/users", verifyToken, requireRole(["admin"]), async (req, res) => {
    try {
        const { email, password, name, role } = req.body;
        if (!email || !password || !role) {
            return res.status(400).json({ error: "Email, contraseña y rol son obligatorios" });
        }
        if (!["customer", "employee", "admin"].includes(role)) {
            return res.status(400).json({ error: "Rol inválido. Debe ser customer, employee o admin" });
        }
        const saltRounds = 10;
        const hashedPassword = await bcrypt_1.default.hash(password, saltRounds);
        const query = `
            INSERT INTO customers (email, password_hash, full_name, username, role)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, email, full_name, username, role
        `;
        const username = email.split("@")[0]; // fallback simple
        const values = [
            email,
            hashedPassword,
            name || "Usuario",
            username,
            role
        ];
        const result = await pool.query(query, values);
        res.status(201).json({
            message: "Usuario creado con éxito",
            user: result.rows[0]
        });
    }
    catch (error) {
        console.error("Error al crear usuario:", error);
        if (error.code === "23505") {
            return res.status(400).json({ error: "El email o username ya existe" });
        }
        const message = error?.detail || error?.message || "Error al crear el usuario en la base de datos";
        return res.status(500).json({ error: message });
    }
});
app.delete("/api/users/:id", verifyToken, requireRole(["admin"]), async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!id || isNaN(id)) {
            return res.status(400).json({ error: "ID inválido" });
        }
        const result = await pool.query("DELETE FROM customers WHERE id = $1 RETURNING *", [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }
        res.json({ message: "Usuario eliminado con éxito" });
    }
    catch (error) {
        console.error("Error al eliminar usuario:", error);
        res.status(500).json({ error: error.message || "Error al eliminar usuario" });
    }
});
app.put("/api/users/:id", verifyToken, requireRole(["admin"]), async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { email, name, role } = req.body;
        if (!id || isNaN(id)) {
            return res.status(400).json({ error: "ID inválido" });
        }
        if (!email || !name || !role) {
            return res.status(400).json({ error: "Email, nombre y rol son obligatorios" });
        }
        if (!["customer", "employee", "admin"].includes(role)) {
            return res.status(400).json({ error: "Rol inválido. Debe ser customer, employee o admin" });
        }
        const result = await pool.query("UPDATE customers SET email = $1, full_name = $2, role = $3 WHERE id = $4 RETURNING id, email, full_name, username, role", [email, name, role, id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }
        res.json({
            message: "Usuario actualizado con éxito",
            user: result.rows[0]
        });
    }
    catch (error) {
        console.error("Error al actualizar usuario:", error);
        if (error.code === "23505") {
            return res.status(400).json({ error: "El email ya existe" });
        }
        res.status(500).json({ error: error.message || "Error al actualizar usuario" });
    }
});
app.post("/api/orders", verifyToken, requireRole(["customer"]), async (req, res) => {
    try {
        const { items, address } = req.body;
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: "El pedido debe contener al menos un producto" });
        }
        if (!address) {
            return res.status(400).json({ error: "La dirección es obligatoria" });
        }
        if (!req.customer) {
            return res.status(401).json({ error: "Usuario no autenticado" });
        }
        const orderTotal = items.reduce((acc, item) => acc + (Number(item.unitPrice) || 0) * (Number(item.quantity) || 0), 0);
        const orderResult = await pool.query(`INSERT INTO orders (customer_id, status, total, address)
             VALUES ($1, $2, $3, $4)
             RETURNING *`, [req.customer.id, "pending", orderTotal, address]);
        const order = orderResult.rows[0];
        const orderItems = [];
        for (const item of items) {
            const productId = Number(item.productId);
            const quantity = Number(item.quantity);
            const unitPrice = Number(item.unitPrice);
            if (!productId || quantity <= 0 || unitPrice <= 0) {
                continue;
            }
            const result = await pool.query(`INSERT INTO order_items (order_id, product_id, quantity, unit_price)
                 VALUES ($1, $2, $3, $4)
                 RETURNING *`, [order.id, productId, quantity, unitPrice]);
            orderItems.push(result.rows[0]);
        }
        res.status(201).json({ order, items: orderItems });
    }
    catch (error) {
        console.error("Error al procesar pedido:", error);
        res.status(500).json({ error: error.message || "Error al procesar pedido" });
    }
});
app.get("/api/orders/my", verifyToken, requireRole(["customer"]), async (req, res) => {
    try {
        if (!req.customer) {
            return res.status(401).json({ error: "Usuario no autenticado" });
        }
        const ordersResult = await pool.query(`SELECT * FROM orders WHERE customer_id = $1 ORDER BY created_at DESC`, [req.customer.id]);
        const orders = ordersResult.rows;
        const orderIds = orders.map((order) => order.id);
        if (orderIds.length === 0) {
            return res.json([]);
        }
        const itemsResult = await pool.query(`SELECT oi.*, p.name AS product_name, p.image_url AS product_image_url
             FROM order_items oi
             LEFT JOIN products p ON p.id = oi.product_id
             WHERE oi.order_id = ANY($1::int[])
             ORDER BY oi.id`, [orderIds]);
        const itemsByOrder = itemsResult.rows.reduce((acc, item) => {
            const orderId = Number(item.order_id);
            if (!acc[orderId]) {
                acc[orderId] = [];
            }
            acc[orderId].push(item);
            return acc;
        }, {});
        const ordersWithItems = orders.map((order) => ({
            ...order,
            items: itemsByOrder[order.id] || [],
        }));
        res.json(ordersWithItems);
    }
    catch (error) {
        console.error("Error obteniendo historial de pedidos:", error);
        res.status(500).json({ error: error.message || "Error al obtener pedidos" });
    }
});
app.get("/api/orders", verifyToken, requireRole(["admin", "employee"]), async (_req, res) => {
    try {
        const ordersResult = await pool.query(`SELECT o.*, c.full_name AS customer_name, c.email AS customer_email
             FROM orders o
             LEFT JOIN customers c ON c.id = o.customer_id
             ORDER BY o.created_at DESC`);
        const orders = ordersResult.rows;
        const orderIds = orders.map((order) => order.id);
        const itemsResult = await pool.query(`SELECT oi.*, p.name AS product_name, p.image_url AS product_image_url
             FROM order_items oi
             LEFT JOIN products p ON p.id = oi.product_id
             WHERE oi.order_id = ANY($1::int[])
             ORDER BY oi.id`, [orderIds]);
        const itemsByOrder = itemsResult.rows.reduce((acc, item) => {
            const orderId = Number(item.order_id);
            if (!acc[orderId]) {
                acc[orderId] = [];
            }
            acc[orderId].push(item);
            return acc;
        }, {});
        const ordersWithItems = orders.map((order) => ({
            ...order,
            items: itemsByOrder[order.id] || [],
        }));
        res.json(ordersWithItems);
    }
    catch (error) {
        console.error("Error obteniendo pedidos:", error);
        res.status(500).json({ error: error.message || "Error al obtener pedidos" });
    }
});
app.patch("/api/orders/:id/status", verifyToken, requireRole(["admin", "employee"]), async (req, res) => {
    try {
        const orderId = Number(req.params.id);
        const { status } = req.body;
        if (!orderId || isNaN(orderId)) {
            return res.status(400).json({ error: "ID de pedido inválido" });
        }
        if (!status) {
            return res.status(400).json({ error: "El nuevo estado es obligatorio" });
        }
        const result = await pool.query(`UPDATE orders SET status = $1 WHERE id = $2 RETURNING *`, [status, orderId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Pedido no encontrado" });
        }
        res.json(result.rows[0]);
    }
    catch (error) {
        console.error("Error actualizando estado de pedido:", error);
        res.status(500).json({ error: error.message || "Error al actualizar estado" });
    }
});
/* ================= FICHAJES (Time Tracking) ================= */
// Clock In
app.post("/api/fichajes/clock-in", verifyToken, async (req, res) => {
    try {
        if (!req.customer) {
            return res.status(401).json({ error: "Usuario no autenticado" });
        }
        const result = await pool.query(`INSERT INTO fichajes (customer_id, tipo, created_at)
             VALUES ($1, 'Entrada', NOW())
             RETURNING *`, [req.customer.id]);
        res.json({
            message: "Entrada registrada",
            fichaje: result.rows[0]
        });
    }
    catch (error) {
        console.error("Error en clock-in:", error);
        res.status(500).json({ error: error.message || "Error al registrar entrada" });
    }
});
// Clock Out
app.post("/api/fichajes/clock-out", verifyToken, async (req, res) => {
    try {
        if (!req.customer) {
            return res.status(401).json({ error: "Usuario no autenticado" });
        }
        const result = await pool.query(`INSERT INTO fichajes (customer_id, tipo, created_at)
             VALUES ($1, 'Salida', NOW())
             RETURNING *`, [req.customer.id]);
        res.json({
            message: "Salida registrada",
            fichaje: result.rows[0]
        });
    }
    catch (error) {
        console.error("Error en clock-out:", error);
        res.status(500).json({ error: error.message || "Error al registrar salida" });
    }
});
// Get fichajes for current user
app.get("/api/fichajes", verifyToken, async (req, res) => {
    try {
        if (!req.customer) {
            return res.status(401).json({ error: "Usuario no autenticado" });
        }
        const result = await pool.query(`SELECT id, customer_id, tipo, created_at FROM fichajes 
             WHERE customer_id = $1
             ORDER BY created_at DESC`, [req.customer.id]);
        res.json(result.rows);
    }
    catch (error) {
        console.error("Error al obtener fichajes:", error);
        res.status(500).json({ error: error.message || "Error al obtener fichajes" });
    }
});
//# sourceMappingURL=index_old.js.map