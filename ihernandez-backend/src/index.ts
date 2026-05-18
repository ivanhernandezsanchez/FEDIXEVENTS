
import express from "express";
import type { NextFunction, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Pool } from "pg";
import cookieParser from "cookie-parser";
import chatRouter from "./chat.js";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET ?? "micontraseña";

const pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT ?? "5432"),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: { rejectUnauthorized: false },
});

const app = express();
const PORT = 3000;

app.use(cookieParser());
app.use(cors({
    origin: true,
    credentials: true,
}));
app.use(express.json());
app.use(chatRouter);

interface AuthRequest extends Request {
    customer?: { id: number; username: string; role: string };
}

const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    let token: string | undefined;

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
        const payload = jwt.verify(token, JWT_SECRET) as { id: number; username: string; role: string };
        req.customer = { id: payload.id, username: payload.username, role: payload.role };
        next();
    } catch (error) {
        return res.status(401).json({ error: "Token inválido o expirado" });
    }
};

const requireRole = (roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.customer) {
            return res.status(401).json({ error: "Usuario no autenticado" });
        }

        if (!roles.includes(req.customer.role)) {
            return res.status(403).json({ error: "No tienes permisos para acceder a este recurso" });
        }

        next();
    };
};

const sendAuthCookie = (res: Response, token: string) => {
    res.cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000,
        path: "/",
    });
};

const buildUser = (user: any) => ({
    id: user.id,
    username: user.username,
    email: user.email,
    name: user.full_name,
    role: user.role ?? "customer",
});

const buildManagedUser = (user: any) => ({
    id: user.id,
    email: user.email,
    name: user.full_name,
    full_name: user.full_name,
    role: user.role ?? "customer",
    username: user.username,
});

const passwordIsValid = async (plainPassword: string, storedPassword: string) => {
    if (!storedPassword) {
        return false;
    }

    if (storedPassword.startsWith("$2a$") || storedPassword.startsWith("$2b$") || storedPassword.startsWith("$2y$")) {
        return bcrypt.compare(plainPassword, storedPassword);
    }

    return plainPassword === storedPassword;
};

const loginCustomer = async (email: string, password: string) => {
    const result = await pool.query(
        "SELECT * FROM customers WHERE email = $1",
        [email]
    );

    const user = result.rows[0];

    if (!user) {
        return null;
    }

    const passwordValid = await passwordIsValid(password, user.password_hash);

    if (!passwordValid) {
        return false;
    }

    return user;
};

const ensureOperationalSchema = async () => {
    await pool.query("ALTER TABLE customers ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'customer'");
    await pool.query("ALTER TABLE activities DROP CONSTRAINT IF EXISTS activities_base_price_check").catch(() => {});
    await pool.query("ALTER TABLE activities DROP CONSTRAINT IF EXISTS activities_price_check").catch(() => {});

    await pool.query(`
        CREATE TABLE IF NOT EXISTS fichajes (
            id SERIAL PRIMARY KEY,
            customer_id INTEGER NOT NULL,
            tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('entrada', 'salida')),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS groups (
            id SERIAL PRIMARY KEY,
            name VARCHAR(200) NOT NULL,
            organizer_id INTEGER,
            city_id INTEGER,
            event_date DATE,
            budget_per_person NUMERIC(10,2) DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
    await pool.query(`ALTER TABLE groups ADD COLUMN IF NOT EXISTS budget_per_person NUMERIC(10,2) DEFAULT 0`).catch(() => {});
    await pool.query(`ALTER TABLE groups ADD COLUMN IF NOT EXISTS organizer_id INTEGER`).catch(() => {});
    await pool.query(`ALTER TABLE groups ADD COLUMN IF NOT EXISTS city_id INTEGER`).catch(() => {});
    await pool.query(`ALTER TABLE groups ADD COLUMN IF NOT EXISTS event_date DATE`).catch(() => {});
    await pool.query(`ALTER TABLE groups ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`).catch(() => {});

    await pool.query(`
        CREATE TABLE IF NOT EXISTS bookings (
            id SERIAL PRIMARY KEY,
            group_id INTEGER,
            total_price NUMERIC(10,2) DEFAULT 0,
            status VARCHAR(30) DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
    await pool.query(`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS group_id INTEGER`).catch(() => {});
    await pool.query(`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS total_price NUMERIC(10,2) DEFAULT 0`).catch(() => {});
    await pool.query(`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'pending'`).catch(() => {});
    await pool.query(`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`).catch(() => {});
    await pool.query(`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS reference_code VARCHAR(50) DEFAULT ''`).catch(() => {});

    await pool.query(`
        CREATE TABLE IF NOT EXISTS booking_items (
            id SERIAL PRIMARY KEY,
            booking_id INTEGER,
            activity_id INTEGER,
            quantity INTEGER DEFAULT 1,
            unit_price NUMERIC(10,2) DEFAULT 0
        )
    `);
    await pool.query(`ALTER TABLE booking_items ADD COLUMN IF NOT EXISTS booking_id INTEGER`).catch(() => {});
    await pool.query(`ALTER TABLE booking_items ADD COLUMN IF NOT EXISTS activity_id INTEGER`).catch(() => {});
    await pool.query(`ALTER TABLE booking_items ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1`).catch(() => {});
    await pool.query(`ALTER TABLE booking_items ADD COLUMN IF NOT EXISTS unit_price NUMERIC(10,2) DEFAULT 0`).catch(() => {});

    await pool.query(`
        CREATE TABLE IF NOT EXISTS ai_plan_submissions (
            id SERIAL PRIMARY KEY,
            suggested_name VARCHAR(150) NOT NULL,
            city_id INTEGER REFERENCES cities(id),
            description TEXT NOT NULL,
            category VARCHAR(100) DEFAULT 'Plan personalizado IA',
            suggested_price NUMERIC(10,2) DEFAULT 0,
            max_capacity INTEGER,
            duration_minutes INTEGER,
            status VARCHAR(20) DEFAULT 'pending',
            created_activity_id INTEGER REFERENCES activities(id),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            reviewed_at TIMESTAMP
        )
    `);
    await pool.query(`
        UPDATE customers
        SET role = 'admin'
        WHERE id = (SELECT MIN(id) FROM customers)
    `).catch(() => {});
};

ensureOperationalSchema()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`🚀 Servidor en http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Error preparando la base de datos:", error);
        process.exit(1);
    });

/* ================= AUTH ================= */

app.post("/api/login", async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email y contraseña son obligatorios" });
        }

        const user = await loginCustomer(email, password);

        if (user === null) {
            return res.status(401).json({ error: "Usuario no encontrado" });
        }

        if (user === false) {
            return res.status(401).json({ error: "Contraseña incorrecta" });
        }

        const role = user.role ?? "customer";
        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                role,
            },
            JWT_SECRET,
            { expiresIn: "1d" }
        );

        sendAuthCookie(res, token);

        res.json({
            message: "Login correcto",
            user: buildUser(user),
        });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email y contraseña son obligatorios" });
        }

        const user = await loginCustomer(email, password);

        if (user === null) {
            return res.status(401).json({ error: "Usuario no encontrado" });
        }

        if (user === false) {
            return res.status(401).json({ error: "Contraseña incorrecta" });
        }

        const role = user.role ?? "customer";
        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                role,
            },
            JWT_SECRET,
            { expiresIn: "1d" }
        );

        sendAuthCookie(res, token);

        res.json({
            message: "Login correcto",
            user: buildUser(user),
        });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

app.post("/api/auth/logout", (_req: Request, res: Response) => {
    res.clearCookie("token", { path: "/" });
    res.json({ message: "Sesión cerrada" });
});

app.get("/api/auth/me", verifyToken, async (req: AuthRequest, res: Response) => {
    if (!req.customer) {
        return res.status(401).json({ error: "Usuario no autenticado" });
    }

    try {
        const result = await pool.query(
            "SELECT id, email, full_name, username, role FROM customers WHERE id = $1",
            [req.customer.id]
        );

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
    } catch (error: any) {
        console.error("Error fetching authenticated user:", error);
        res.status(500).json({ error: "Error al obtener información del usuario" });
    }
});

app.post("/api/register", async (req: Request, res: Response) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email y contraseña son obligatorios" });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const username = email.split("@")[0];
        const fullName = name || "Usuario";
        const nameParts = fullName.trim().split(/\s+/);
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(" ") || "-";

        const result = await pool.query(`
            INSERT INTO customers (email, password_hash, full_name, username, first_name, last_name)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, email, full_name, username
        `, [email, hashedPassword, fullName, username, firstName, lastName]);

        res.status(201).json({
            message: "Usuario registrado con éxito",
            user: result.rows[0]
        });

    } catch (error: any) {
        console.error("Error al registrar usuario:", error);

        if (error.code === "23505") {
            return res.status(400).json({ error: "El email ya existe" });
        }

        return res.status(500).json({ error: error.message || "Error al registrar" });
    }
});

/* ================= CITIES ================= */

app.get("/api/cities", async (_req: Request, res: Response) => {
    try {
        const result = await pool.query("SELECT * FROM cities ORDER BY name");
        res.json(result.rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/* ================= ACTIVITIES ================= */

app.get("/api/activities", async (req: Request, res: Response) => {
    try {
        const { city_id } = req.query;
        let query = `
            SELECT 
                a.*,
                p.name as provider_name,
                COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0) AS "avgRating"
            FROM activities a
            LEFT JOIN providers p ON p.id = a.provider_id
            LEFT JOIN reviews r ON r.activity_id = a.id
        `;

        const params: any[] = [];

        if (city_id) {
            query += " WHERE a.city_id = $1 OR a.provider_id IS NULL";
            params.push(city_id);
        }

        query += " GROUP BY a.id, p.name ORDER BY a.provider_id NULLS LAST, a.id";

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.get("/api/activities/:id", async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);

        if (!id || isNaN(id)) {
            return res.status(400).json({ error: "ID inválido" });
        }

        const result = await pool.query(`
            SELECT 
                a.*,
                p.name as provider_name,
                COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0) AS "avgRating"
            FROM activities a
            LEFT JOIN providers p ON p.id = a.provider_id
            LEFT JOIN reviews r ON r.activity_id = a.id
            WHERE a.id = $1
            GROUP BY a.id, p.name
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Actividad no encontrada" });
        }

        res.json(result.rows[0]);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.post("/api/activities", verifyToken, requireRole(["admin"]), async (req: Request, res: Response) => {
    try {
        const { provider_id, city_id, name, description, category, price, duration_minutes, max_capacity } = req.body;

        if (!city_id || !name || !description || !category || !price) {
            return res.status(400).json({ error: "Ciudad, nombre, descripción, categoría y precio son obligatorios" });
        }

        const result = await pool.query(`
            INSERT INTO activities (provider_id, city_id, name, description, category, price, duration_minutes, max_capacity)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `, [
            provider_id || null,
            city_id,
            name,
            description,
            category,
            price,
            duration_minutes || null,
            max_capacity || null,
        ]);

        res.status(201).json(result.rows[0]);
    } catch (error: any) {
        console.error("Error creando actividad:", error);
        res.status(500).json({ error: error.message || "Error al crear producto" });
    }
});

app.put("/api/activities/:id", verifyToken, requireRole(["admin"]), async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const { provider_id, city_id, name, description, category, price, duration_minutes, max_capacity } = req.body;

        if (!id || isNaN(id)) {
            return res.status(400).json({ error: "ID inválido" });
        }

        if (!city_id || !name || !description || !category || !price) {
            return res.status(400).json({ error: "Ciudad, nombre, descripción, categoría y precio son obligatorios" });
        }

        const result = await pool.query(`
            UPDATE activities
            SET provider_id = $1,
                city_id = $2,
                name = $3,
                description = $4,
                category = $5,
                price = $6,
                duration_minutes = $7,
                max_capacity = $8
            WHERE id = $9
            RETURNING *
        `, [
            provider_id || null,
            city_id,
            name,
            description,
            category,
            price,
            duration_minutes || null,
            max_capacity || null,
            id,
        ]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }

        res.json(result.rows[0]);
    } catch (error: any) {
        console.error("Error actualizando actividad:", error);
        res.status(500).json({ error: error.message || "Error al actualizar producto" });
    }
});

app.delete("/api/activities/:id", verifyToken, requireRole(["admin"]), async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);

        if (!id || isNaN(id)) {
            return res.status(400).json({ error: "ID inválido" });
        }

        const result = await pool.query("DELETE FROM activities WHERE id = $1 RETURNING id", [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }

        res.json({ message: "Producto eliminado" });
    } catch (error: any) {
        console.error("Error eliminando actividad:", error);
        res.status(500).json({ error: error.message || "Error al eliminar producto" });
    }
});

/* ================= AI PLAN SUBMISSIONS ================= */

app.post("/api/ai-plan-submissions", async (req: Request, res: Response) => {
    try {
        const {
            suggestedName,
            cityId,
            description,
            category,
            suggestedPrice,
            maxCapacity,
            durationMinutes,
        } = req.body;

        if (!suggestedName || !description) {
            return res.status(400).json({ error: "Nombre y descripción son obligatorios" });
        }

        const result = await pool.query(`
            INSERT INTO ai_plan_submissions (
                suggested_name,
                city_id,
                description,
                category,
                suggested_price,
                max_capacity,
                duration_minutes
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `, [
            String(suggestedName).slice(0, 150),
            Number(cityId) || null,
            String(description),
            String(category || "Plan personalizado IA").slice(0, 100),
            Number(suggestedPrice) || 0,
            Number(maxCapacity) || null,
            Number(durationMinutes) || null,
        ]);

        res.status(201).json(result.rows[0]);
    } catch (error: any) {
        console.error("Error guardando propuesta IA:", error);
        res.status(500).json({ error: error.message || "Error al guardar propuesta IA" });
    }
});

app.get("/api/ai-plan-submissions", verifyToken, requireRole(["admin"]), async (_req: Request, res: Response) => {
    try {
        const result = await pool.query(`
            SELECT s.*, c.name AS city_name
            FROM ai_plan_submissions s
            LEFT JOIN cities c ON c.id = s.city_id
            ORDER BY s.created_at DESC
        `);

        res.json(result.rows);
    } catch (error: any) {
        console.error("Error obteniendo propuestas IA:", error);
        res.status(500).json({ error: error.message || "Error al obtener propuestas IA" });
    }
});

app.get("/api/community-ideas", async (_req: Request, res: Response) => {
    try {
        const result = await pool.query(`
            SELECT
                s.id,
                s.suggested_name,
                s.description,
                s.category,
                s.suggested_price,
                s.max_capacity,
                s.duration_minutes,
                s.created_activity_id,
                s.reviewed_at,
                c.name AS city_name,
                c.country AS city_country,
                a.price,
                a.city_id
            FROM ai_plan_submissions s
            LEFT JOIN activities a ON a.id = s.created_activity_id
            LEFT JOIN cities c ON c.id = COALESCE(a.city_id, s.city_id)
            WHERE s.status = 'approved'
              AND s.created_activity_id IS NOT NULL
            ORDER BY s.reviewed_at DESC NULLS LAST, s.created_at DESC
            LIMIT 6
        `);

        res.json(result.rows);
    } catch (error: any) {
        console.error("Error obteniendo ideas de comunidad:", error);
        res.status(500).json({ error: error.message || "Error al obtener ideas de comunidad" });
    }
});

app.delete("/api/ai-plan-submissions/:id", verifyToken, requireRole(["admin"]), async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        if (!id || isNaN(id)) return res.status(400).json({ error: "ID inválido" });
        await pool.query("DELETE FROM ai_plan_submissions WHERE id = $1", [id]);
        res.json({ ok: true });
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Error al eliminar propuesta" });
    }
});

app.patch("/api/ai-plan-submissions/:id/reject", verifyToken, requireRole(["admin"]), async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);

        if (!id || isNaN(id)) {
            return res.status(400).json({ error: "ID inválido" });
        }

        const result = await pool.query(`
            UPDATE ai_plan_submissions
            SET status = 'rejected',
                reviewed_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Propuesta no encontrada" });
        }

        res.json(result.rows[0]);
    } catch (error: any) {
        console.error("Error rechazando propuesta IA:", error);
        res.status(500).json({ error: error.message || "Error al rechazar propuesta IA" });
    }
});

app.patch("/api/ai-plan-submissions/:id/approve", verifyToken, requireRole(["admin"]), async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);

        if (!id || isNaN(id)) {
            return res.status(400).json({ error: "ID inválido" });
        }

        const submissionResult = await pool.query(`
            SELECT *
            FROM ai_plan_submissions
            WHERE id = $1
        `, [id]);

        const submission = submissionResult.rows[0];

        if (!submission) {
            return res.status(404).json({ error: "Propuesta no encontrada" });
        }

        if (submission.status !== "pending") {
            return res.status(400).json({ error: "Esta propuesta ya fue revisada" });
        }

        let approvalCityId = submission.city_id;
        if (!approvalCityId) {
            const fallback = await pool.query("SELECT id FROM cities ORDER BY id LIMIT 1");
            approvalCityId = fallback.rows[0]?.id ?? null;
        }

        const activityResult = await pool.query(`
            INSERT INTO activities (provider_id, city_id, name, description, category, price, duration_minutes, max_capacity)
            VALUES (NULL, $1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `, [
            approvalCityId,
            submission.suggested_name,
            submission.description,
            submission.category || "Plan personalizado IA",
            Number(submission.suggested_price) || 0,
            submission.duration_minutes || null,
            submission.max_capacity || null,
        ]);

        const activity = activityResult.rows[0];

        await pool.query(`
            UPDATE ai_plan_submissions
            SET status = 'approved',
                created_activity_id = $2,
                reviewed_at = CURRENT_TIMESTAMP
            WHERE id = $1
        `, [id, activity.id]);

        res.json({ submission: { ...submission, status: "approved", created_activity_id: activity.id }, activity });
    } catch (error: any) {
        console.error("Error aprobando propuesta IA:", error);
        res.status(500).json({ error: error.message || "Error al aprobar propuesta IA" });
    }
});

app.post("/api/activities/:id/reviews", async (req: Request, res: Response) => {
    try {
        const activity_id = Number(req.params.id);
        const { rating, comment, customerId } = req.body;

        if (!activity_id || isNaN(activity_id)) {
            return res.status(400).json({ error: "ID inválido" });
        }

        const numRating = Number(rating);

        if (isNaN(numRating) || numRating < 1 || numRating > 5) {
            return res.status(400).json({ error: "Rating debe ser entre 1 y 5" });
        }

        const result = await pool.query(`
            INSERT INTO reviews (activity_id, customer_id, rating, comment)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (activity_id, customer_id)
            DO UPDATE SET rating = EXCLUDED.rating, comment = EXCLUDED.comment
            RETURNING *
        `, [activity_id, customerId ?? 1, numRating, comment ?? ""]);

        res.status(201).json(result.rows[0]);
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.get("/api/activities/:id/reviews", async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);

        if (!id || isNaN(id)) {
            return res.status(400).json({ error: "ID inválido" });
        }

        const result = await pool.query(`
            SELECT 
                r.id,
                r.rating,
                r.comment,
                COALESCE(c.full_name, 'Anónimo') AS customer,
                r.created_at
            FROM reviews r
            LEFT JOIN customers c ON c.id = r.customer_id
            WHERE r.activity_id = $1
            ORDER BY r.created_at DESC
        `, [id]);

        res.json(result.rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/* ================= HOTELS ================= */

app.get("/api/hotels", async (req: Request, res: Response) => {
    try {
        const { city_id } = req.query;
        let query = "SELECT * FROM hotels";

        if (city_id) {
            query += ` WHERE city_id = $1 ORDER BY name`;
            const result = await pool.query(query, [city_id]);
            return res.json(result.rows);
        }

        query += " ORDER BY name";
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.get("/api/hotels/:id", async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);

        if (!id || isNaN(id)) {
            return res.status(400).json({ error: "ID inválido" });
        }

        const result = await pool.query("SELECT * FROM hotels WHERE id = $1", [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Hotel no encontrado" });
        }

        res.json(result.rows[0]);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/* ================= GROUPS (Despedidas) ================= */

app.get("/api/groups", verifyToken, async (req: AuthRequest, res: Response) => {
    try {
        if (!req.customer) {
            return res.status(401).json({ error: "Usuario no autenticado" });
        }

        const result = await pool.query(`
            SELECT g.* FROM groups g
            INNER JOIN group_members gm ON gm.group_id = g.id
            WHERE gm.customer_id = $1
            ORDER BY g.event_date DESC
        `, [req.customer.id]);

        res.json(result.rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.get("/api/groups/:id", verifyToken, async (req: AuthRequest, res: Response) => {
    try {
        const id = Number(req.params.id);

        if (!id || isNaN(id)) {
            return res.status(400).json({ error: "ID inválido" });
        }

        const groupResult = await pool.query("SELECT * FROM groups WHERE id = $1", [id]);

        if (groupResult.rows.length === 0) {
            return res.status(404).json({ error: "Grupo no encontrado" });
        }

        const membersResult = await pool.query(`
            SELECT gm.*, c.full_name, c.email
            FROM group_members gm
            LEFT JOIN customers c ON c.id = gm.customer_id
            WHERE gm.group_id = $1
        `, [id]);

        res.json({
            ...groupResult.rows[0],
            members: membersResult.rows
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.post("/api/groups", verifyToken, async (req: AuthRequest, res: Response) => {
    try {
        if (!req.customer) {
            return res.status(401).json({ error: "Usuario no autenticado" });
        }

        const { name, city_id, event_date, budget_per_person } = req.body;

        if (!name || !city_id || !event_date || !budget_per_person) {
            return res.status(400).json({ error: "Faltan campos obligatorios" });
        }

        const groupResult = await pool.query(`
            INSERT INTO groups (name, organizer_id, city_id, event_date, budget_per_person)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `, [name, req.customer.id, city_id, event_date, budget_per_person]);

        const group = groupResult.rows[0];

        await pool.query(`
            INSERT INTO group_members (group_id, customer_id, role)
            VALUES ($1, $2, 'organizer')
        `, [group.id, req.customer.id]);

        res.status(201).json(group);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.post("/api/groups/:id/members", verifyToken, async (req: AuthRequest, res: Response) => {
    try {
        const group_id = Number(req.params.id);
        const { customer_id, role } = req.body;

        if (!group_id || isNaN(group_id)) {
            return res.status(400).json({ error: "ID de grupo inválido" });
        }

        const result = await pool.query(`
            INSERT INTO group_members (group_id, customer_id, role)
            VALUES ($1, $2, $3)
            RETURNING *
        `, [group_id, customer_id, role ?? "member"]);

        res.status(201).json(result.rows[0]);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/* ================= USERS (Intranet) ================= */

app.get("/api/users", verifyToken, requireRole(["admin"]), async (_req: Request, res: Response) => {
    try {
        const result = await pool.query(`
            SELECT id, email, full_name, username, role
            FROM customers
            ORDER BY id
        `);

        res.json(result.rows.map(buildManagedUser));
    } catch (error: any) {
        console.error("Error obteniendo usuarios:", error);
        res.status(500).json({ error: error.message || "Error al obtener usuarios" });
    }
});

app.post("/api/users", verifyToken, requireRole(["admin"]), async (req: AuthRequest, res: Response) => {
    try {
        const { email, password, name, role } = req.body;

        if (!email || !password || !role) {
            return res.status(400).json({ error: "Email, contraseña y rol son obligatorios" });
        }

        if (!["customer", "employee", "admin"].includes(role)) {
            return res.status(400).json({ error: "Rol inválido" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const username = email.split("@")[0];
        const fullName = name || "Usuario";
        const nameParts = fullName.trim().split(/\s+/);
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(" ") || "-";

        const result = await pool.query(`
            INSERT INTO customers (email, password_hash, full_name, username, role, first_name, last_name)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id, email, full_name, username, role
        `, [email, hashedPassword, fullName, username, role, firstName, lastName]);

        res.status(201).json({
            message: "Usuario creado con éxito",
            user: buildManagedUser(result.rows[0]),
        });
    } catch (error: any) {
        console.error("Error creando usuario:", error);

        if (error.code === "23505") {
            return res.status(400).json({ error: "El email ya existe" });
        }

        res.status(500).json({ error: error.message || "Error al crear usuario" });
    }
});

app.put("/api/users/:id", verifyToken, requireRole(["admin"]), async (req: Request, res: Response) => {
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
            return res.status(400).json({ error: "Rol inválido" });
        }

        const result = await pool.query(`
            UPDATE customers
            SET email = $1, full_name = $2, role = $3
            WHERE id = $4
            RETURNING id, email, full_name, username, role
        `, [email, name, role, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        res.json({
            message: "Usuario actualizado con éxito",
            user: buildManagedUser(result.rows[0]),
        });
    } catch (error: any) {
        console.error("Error actualizando usuario:", error);

        if (error.code === "23505") {
            return res.status(400).json({ error: "El email ya existe" });
        }

        res.status(500).json({ error: error.message || "Error al actualizar usuario" });
    }
});

app.delete("/api/users/:id", verifyToken, requireRole(["admin"]), async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);

        if (!id || isNaN(id)) {
            return res.status(400).json({ error: "ID inválido" });
        }

        const result = await pool.query("DELETE FROM customers WHERE id = $1 RETURNING id", [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        res.json({ message: "Usuario eliminado con éxito" });
    } catch (error: any) {
        console.error("Error eliminando usuario:", error);
        res.status(500).json({ error: error.message || "Error al eliminar usuario" });
    }
});

/* ================= BOOKINGS (Reservas) ================= */

app.get("/api/bookings", verifyToken, async (req: AuthRequest, res: Response) => {
    try {
        if (!req.customer) {
            return res.status(401).json({ error: "Usuario no autenticado" });
        }

        const result = await pool.query(`
            SELECT b.*, g.name as group_name
            FROM bookings b
            INNER JOIN groups g ON g.id = b.group_id
            INNER JOIN group_members gm ON gm.group_id = g.id
            WHERE gm.customer_id = $1
            ORDER BY b.created_at DESC
        `, [req.customer.id]);

        res.json(result.rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.get("/api/bookings/:id", verifyToken, async (req: AuthRequest, res: Response) => {
    try {
        const id = Number(req.params.id);

        if (!id || isNaN(id)) {
            return res.status(400).json({ error: "ID inválido" });
        }

        const bookingResult = await pool.query("SELECT * FROM bookings WHERE id = $1", [id]);

        if (bookingResult.rows.length === 0) {
            return res.status(404).json({ error: "Reserva no encontrada" });
        }

        const itemsResult = await pool.query(`
            SELECT bi.*, a.name as activity_name
            FROM booking_items bi
            LEFT JOIN activities a ON a.id = bi.activity_id
            WHERE bi.booking_id = $1
        `, [id]);

        res.json({
            ...bookingResult.rows[0],
            items: itemsResult.rows
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.post("/api/bookings", verifyToken, async (req: AuthRequest, res: Response) => {
    try {
        if (!req.customer) {
            return res.status(401).json({ error: "Usuario no autenticado" });
        }

        const { group_id, items } = req.body;

        if (!group_id || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: "Datos de reserva inválidos" });
        }

        const total_price = items.reduce((sum: number, item: any) => {
            return sum + (Number(item.unit_price) * Number(item.quantity));
        }, 0);

        const bookingResult = await pool.query(`
            INSERT INTO bookings (group_id, total_price, status)
            VALUES ($1, $2, 'pending')
            RETURNING *
        `, [group_id, total_price]);

        const booking = bookingResult.rows[0];
        const bookingItems = [];

        for (const item of items) {
            const itemResult = await pool.query(`
                INSERT INTO booking_items (booking_id, activity_id, quantity, unit_price)
                VALUES ($1, $2, $3, $4)
                RETURNING *
            `, [booking.id, item.activity_id, item.quantity, item.unit_price]);

            bookingItems.push(itemResult.rows[0]);
        }

        res.status(201).json({
            booking,
            items: bookingItems
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.patch("/api/bookings/:id/status", verifyToken, async (req: AuthRequest, res: Response) => {
    try {
        const id = Number(req.params.id);
        const { status } = req.body;

        if (!id || isNaN(id)) {
            return res.status(400).json({ error: "ID inválido" });
        }

        if (!status) {
            return res.status(400).json({ error: "Status es obligatorio" });
        }

        const result = await pool.query(
            "UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *",
            [status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Reserva no encontrada" });
        }

        res.json(result.rows[0]);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/* ================= ORDERS (Intranet alias for bookings) ================= */

app.get("/api/orders", verifyToken, requireRole(["admin"]), async (_req: Request, res: Response) => {
    try {
        const bookingsResult = await pool.query(`
            SELECT
                b.id,
                g.organizer_id AS customer_id,
                b.status,
                b.total_price AS total,
                g.name AS address,
                b.created_at,
                c.full_name AS customer_name,
                c.email AS customer_email
            FROM bookings b
            LEFT JOIN groups g ON g.id = b.group_id
            LEFT JOIN customers c ON c.id = g.organizer_id
            ORDER BY b.created_at DESC
        `);

        const bookings = bookingsResult.rows;
        const bookingIds = bookings.map((booking: any) => booking.id);

        if (bookingIds.length === 0) {
            return res.json([]);
        }

        const itemsResult = await pool.query(`
            SELECT
                bi.id,
                bi.booking_id AS order_id,
                bi.activity_id AS product_id,
                bi.quantity,
                bi.unit_price,
                a.name AS product_name,
                NULL::text AS product_image_url
            FROM booking_items bi
            LEFT JOIN activities a ON a.id = bi.activity_id
            WHERE bi.booking_id = ANY($1::int[])
            ORDER BY bi.id
        `, [bookingIds]);

        const itemsByBooking = itemsResult.rows.reduce((acc: Record<number, any[]>, item: any) => {
            const bookingId = Number(item.order_id);
            if (!acc[bookingId]) {
                acc[bookingId] = [];
            }
            acc[bookingId].push(item);
            return acc;
        }, {} as Record<number, any[]>);

        const orders = bookings.map((booking: any) => ({
            ...booking,
            items: itemsByBooking[booking.id] || [],
        }));

        res.json(orders);
    } catch (error: any) {
        console.error("Error obteniendo pedidos:", error);
        res.status(500).json({ error: error.message || "Error al obtener pedidos" });
    }
});

app.post("/api/orders", verifyToken, requireRole(["customer", "admin"]), async (req: AuthRequest, res: Response) => {
    try {
        if (!req.customer) {
            return res.status(401).json({ error: "Usuario no autenticado" });
        }

        const { items, address } = req.body;

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: "El carrito debe contener al menos un producto" });
        }

        if (!address) {
            return res.status(400).json({ error: "Indica un nombre de grupo o referencia" });
        }

        const firstCustomPlan = items.find((item: any) => item.customPlan?.cityId);
        const activityIds = items
            .map((item: any) => Number(item.activityId || item.productId))
            .filter((id: number) => id > 0);
        const cityResult = activityIds.length > 0
            ? await pool.query("SELECT city_id FROM activities WHERE id = $1", [activityIds[0]])
            : { rows: [] };
        const cityId = cityResult.rows[0]?.city_id ?? Number(firstCustomPlan?.customPlan?.cityId) ?? null;

        const total = items.reduce((sum: number, item: any) => {
            return sum + Number(item.unitPrice || 0) * Number(item.quantity || 0);
        }, 0);

        const groupResult = await pool.query(`
            INSERT INTO groups (name, organizer_id, city_id, event_date, budget_per_person)
            VALUES ($1, $2, $3, CURRENT_DATE, $4)
            RETURNING *
        `, [address, req.customer.id, cityId || null, total]);

        const refCode = "FDX-" + Date.now().toString(36).toUpperCase() + "-" + Math.random().toString(36).slice(2, 6).toUpperCase();
        const bookingResult = await pool.query(`
            INSERT INTO bookings (group_id, total_price, status, reference_code)
            VALUES ($1, $2, 'pending', $3)
            RETURNING *
        `, [groupResult.rows[0].id, total, refCode]);

        const booking = bookingResult.rows[0];
        const bookingItems = [];

        for (const item of items) {
            let activityId = Number(item.activityId || item.productId);
            const quantity = Number(item.quantity);
            const unitPrice = Number(item.unitPrice);

            if (item.customPlan && activityId < 0) {
                const customPlan = item.customPlan;
                let aiCityId = Number(customPlan.cityId) || cityId || null;
                if (!aiCityId) {
                    const fallback = await pool.query("SELECT id FROM cities ORDER BY id LIMIT 1");
                    aiCityId = fallback.rows[0]?.id ?? null;
                }
                const customActivityResult = await pool.query(`
                    INSERT INTO activities (provider_id, city_id, name, description, category, price, duration_minutes, max_capacity)
                    VALUES (NULL, $1, $2, $3, $4, $5, $6, $7)
                    RETURNING id
                `, [
                    aiCityId,
                    String(customPlan.name || "Plan personalizado IA").slice(0, 150),
                    String(customPlan.description || "Plan personalizado creado desde el chat IA"),
                    String(customPlan.category || "Plan personalizado IA").slice(0, 100),
                    unitPrice,
                    Number(customPlan.durationMinutes) || 240,
                    Number(customPlan.maxCapacity) || quantity,
                ]);

                activityId = Number(customActivityResult.rows[0].id);
            }

            if (!activityId || activityId <= 0 || quantity <= 0 || unitPrice < 0) continue;

            const itemResult = await pool.query(`
                INSERT INTO booking_items (booking_id, activity_id, quantity, unit_price)
                VALUES ($1, $2, $3, $4)
                RETURNING *
            `, [booking.id, activityId, quantity, unitPrice]);

            bookingItems.push(itemResult.rows[0]);
        }

        res.status(201).json({ order: booking, items: bookingItems });
    } catch (error: any) {
        console.error("Error procesando pedido:", error);
        res.status(500).json({ error: error.message || "Error al procesar pedido" });
    }
});

app.get("/api/orders/my", verifyToken, requireRole(["customer", "admin"]), async (req: AuthRequest, res: Response) => {
    try {
        if (!req.customer) {
            return res.status(401).json({ error: "Usuario no autenticado" });
        }

        const bookingsResult = await pool.query(`
            SELECT
                b.id,
                b.status,
                b.total_price AS total,
                g.name AS address,
                b.created_at
            FROM bookings b
            INNER JOIN groups g ON g.id = b.group_id
            WHERE g.organizer_id = $1
            ORDER BY b.created_at DESC
        `, [req.customer.id]);

        const bookings = bookingsResult.rows;
        const bookingIds = bookings.map((booking: any) => booking.id);

        if (bookingIds.length === 0) {
            return res.json([]);
        }

        const itemsResult = await pool.query(`
            SELECT
                bi.id,
                bi.booking_id AS order_id,
                bi.activity_id AS product_id,
                bi.quantity,
                bi.unit_price,
                a.name AS product_name
            FROM booking_items bi
            LEFT JOIN activities a ON a.id = bi.activity_id
            WHERE bi.booking_id = ANY($1::int[])
            ORDER BY bi.id
        `, [bookingIds]);

        const itemsByBooking = itemsResult.rows.reduce((acc: Record<number, any[]>, item: any) => {
            const bookingId = Number(item.order_id);
            if (!acc[bookingId]) acc[bookingId] = [];
            acc[bookingId].push(item);
            return acc;
        }, {} as Record<number, any[]>);

        res.json(bookings.map((booking: any) => ({
            ...booking,
            items: itemsByBooking[booking.id] || [],
        })));
    } catch (error: any) {
        console.error("Error obteniendo historial:", error);
        res.status(500).json({ error: error.message || "Error al obtener historial" });
    }
});

app.patch("/api/orders/:id/status", verifyToken, requireRole(["admin"]), async (req: Request, res: Response) => {
    try {
        const orderId = Number(req.params.id);
        const { status } = req.body;

        if (!orderId || isNaN(orderId)) {
            return res.status(400).json({ error: "ID de pedido inválido" });
        }

        if (!status) {
            return res.status(400).json({ error: "El nuevo estado es obligatorio" });
        }

        const result = await pool.query(
            "UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *",
            [status, orderId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Pedido no encontrado" });
        }

        res.json(result.rows[0]);
    } catch (error: any) {
        console.error("Error actualizando estado de pedido:", error);
        res.status(500).json({ error: error.message || "Error al actualizar estado" });
    }
});

/* ================= PAYMENTS (Pagos) ================= */

app.get("/api/payments", verifyToken, async (req: AuthRequest, res: Response) => {
    try {
        if (!req.customer) {
            return res.status(401).json({ error: "Usuario no autenticado" });
        }

        const result = await pool.query(`
            SELECT p.*, b.group_id
            FROM payments p
            INNER JOIN bookings b ON b.id = p.booking_id
            INNER JOIN groups g ON g.id = b.group_id
            INNER JOIN group_members gm ON gm.group_id = g.id
            WHERE gm.customer_id = $1
            ORDER BY p.paid_at DESC
        `, [req.customer.id]);

        res.json(result.rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.post("/api/payments", verifyToken, async (req: AuthRequest, res: Response) => {
    try {
        const { booking_id, amount, method } = req.body;

        if (!booking_id || !amount || !method) {
            return res.status(400).json({ error: "Faltan campos obligatorios" });
        }

        const result = await pool.query(`
            INSERT INTO payments (booking_id, amount, method, status, paid_at)
            VALUES ($1, $2, $3, 'paid', NOW())
            RETURNING *
        `, [booking_id, amount, method]);

        res.status(201).json(result.rows[0]);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.get("/api/payments/booking/:booking_id", verifyToken, async (req: AuthRequest, res: Response) => {
    try {
        const booking_id = Number(req.params.booking_id);

        if (!booking_id || isNaN(booking_id)) {
            return res.status(400).json({ error: "ID inválido" });
        }

        const result = await pool.query(`
            SELECT * FROM payments WHERE booking_id = $1
            ORDER BY paid_at DESC
        `, [booking_id]);

        res.json(result.rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/* ================= PROVIDERS (Proveedores) ================= */

app.get("/api/providers", async (req: Request, res: Response) => {
    try {
        const { city_id } = req.query;
        let query = "SELECT * FROM providers";

        if (city_id) {
            query += ` WHERE city_id = $1 ORDER BY name`;
            const result = await pool.query(query, [city_id]);
            return res.json(result.rows);
        }

        query += " ORDER BY name";
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.get("/api/providers/:id", async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);

        if (!id || isNaN(id)) {
            return res.status(400).json({ error: "ID inválido" });
        }

        const result = await pool.query("SELECT * FROM providers WHERE id = $1", [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Proveedor no encontrado" });
        }

        res.json(result.rows[0]);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/* ================= TEST ================= */

/* ================= FICHAJES ================= */

app.get("/api/fichajes", verifyToken, async (req: AuthRequest, res: Response) => {
    try {
        if (!req.customer) return res.status(401).json({ error: "No autenticado" });
        const result = await pool.query(
            "SELECT * FROM fichajes WHERE customer_id = $1 ORDER BY created_at DESC LIMIT 100",
            [req.customer.id]
        );
        res.json(result.rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.post("/api/fichajes/clock-in", verifyToken, async (req: AuthRequest, res: Response) => {
    try {
        if (!req.customer) return res.status(401).json({ error: "No autenticado" });
        const result = await pool.query(
            "INSERT INTO fichajes (customer_id, tipo) VALUES ($1, 'entrada') RETURNING *",
            [req.customer.id]
        );
        res.status(201).json(result.rows[0]);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.post("/api/fichajes/clock-out", verifyToken, async (req: AuthRequest, res: Response) => {
    try {
        if (!req.customer) return res.status(401).json({ error: "No autenticado" });
        const result = await pool.query(
            "INSERT INTO fichajes (customer_id, tipo) VALUES ($1, 'salida') RETURNING *",
            [req.customer.id]
        );
        res.status(201).json(result.rows[0]);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.get("/api/test-db", async (_req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json(error);
    }
});

