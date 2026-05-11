package com.ssunen.backend.controller;

import com.google.gson.Gson;
import com.ssunen.backend.dao.AiPlanDAO;
import com.ssunen.backend.dao.CatalogDAO;
import com.ssunen.backend.dao.FichajeDAO;
import com.ssunen.backend.dao.OrderDAO;
import com.ssunen.backend.dao.SchemaDAO;
import com.ssunen.backend.dao.UserDAO;
import com.ssunen.backend.exception.ApiException;
import com.ssunen.backend.exception.BadRequestException;
import com.ssunen.backend.exception.ConflictException;
import com.ssunen.backend.exception.NotFoundException;
import com.ssunen.backend.security.AuthService;
import com.ssunen.backend.security.AuthService.AuthUser;
import com.ssunen.backend.util.RequestUtils;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.math.BigDecimal;
import java.sql.SQLException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@WebServlet(name = "FrontControllerServlet", urlPatterns = "/api/*", loadOnStartup = 1)
public class FrontControllerServlet extends HttpServlet {
    private final Gson gson = new Gson();
    private final AuthService auth = new AuthService();
    private final UserDAO users = new UserDAO();
    private final CatalogDAO catalog = new CatalogDAO();
    private final AiPlanDAO aiPlans = new AiPlanDAO();
    private final OrderDAO orders = new OrderDAO();
    private final FichajeDAO fichajes = new FichajeDAO();

    @Override
    public void init() throws ServletException {
        try {
            new SchemaDAO().ensureOperationalSchema();
        } catch (SQLException ex) {
            throw new ServletException("No se pudo preparar el esquema operacional", ex);
        }
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws IOException {
        handle(req, res);
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res) throws IOException {
        handle(req, res);
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse res) throws IOException {
        handle(req, res);
    }

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse res) throws IOException {
        handle(req, res);
    }

    @Override
    protected void service(HttpServletRequest req, HttpServletResponse res) throws IOException, ServletException {
        if ("PATCH".equalsIgnoreCase(req.getMethod())) {
            handle(req, res);
            return;
        }
        super.service(req, res);
    }

    @Override
    protected void doOptions(HttpServletRequest req, HttpServletResponse res) {
        applyCors(req, res);
        res.setStatus(HttpServletResponse.SC_NO_CONTENT);
    }

    private void handle(HttpServletRequest req, HttpServletResponse res) throws IOException {
        applyCors(req, res);
        res.setCharacterEncoding("UTF-8");
        res.setContentType("application/json");

        try {
            Object payload = route(req, res);
            if (!res.isCommitted()) {
                writeJson(res, payload == null ? Map.of("message", "OK") : payload);
            }
        } catch (ApiException ex) {
            writeError(res, ex.getStatusCode(), ex.getMessage());
        } catch (SQLException ex) {
            if ("23505".equals(ex.getSQLState())) {
                writeError(res, 400, "El registro ya existe");
            } else if ("23503".equals(ex.getSQLState())) {
                writeError(res, 400, "La operación referencia datos inexistentes");
            } else {
                log("Error SQL", ex);
                writeError(res, 500, "Error al acceder a la base de datos");
            }
        } catch (IOException ex) {
            throw ex;
        } catch (RuntimeException ex) {
            log("Error inesperado", ex);
            writeError(res, 500, "Error interno de la aplicación");
        }
    }

    private Object route(HttpServletRequest req, HttpServletResponse res) throws IOException, ApiException, SQLException {
        String method = req.getMethod();
        String path = RequestUtils.path(req);

        if ("POST".equals(method) && ("/login".equals(path) || "/auth/login".equals(path))) {
            return login(req, res);
        }
        if ("POST".equals(method) && "/auth/logout".equals(path)) {
            clearAuthCookie(res);
            return Map.of("message", "Sesión cerrada");
        }
        if ("GET".equals(method) && "/auth/me".equals(path)) {
            AuthUser user = requireUser(req);
            Map<String, Object> dbUser = requireFound(users.findById(user.id()), "Usuario no encontrado");
            return Map.of("user", publicUser(dbUser));
        }
        if ("POST".equals(method) && "/register".equals(path)) {
            return register(req, false);
        }

        if ("GET".equals(method) && "/cities".equals(path)) {
            return catalog.findCities();
        }
        if ("GET".equals(method) && "/community-ideas".equals(path)) {
            return catalog.findCommunityIdeas();
        }
        if (path.startsWith("/activities")) {
            return activities(req, method, path);
        }
        if (path.startsWith("/ai-plan-submissions")) {
            return aiPlanSubmissions(req, method, path);
        }
        if (path.startsWith("/users")) {
            return users(req, method, path);
        }
        if (path.startsWith("/orders")) {
            return orders(req, method, path);
        }
        if (path.startsWith("/fichajes")) {
            return fichajes(req, method, path);
        }
        if ("GET".equals(method) && "/test-db".equals(path)) {
            return new com.ssunen.backend.dao.JdbcTemplate().query("SELECT NOW()");
        }

        throw new NotFoundException("Ruta no encontrada");
    }

    private Object activities(HttpServletRequest req, String method, String path) throws ApiException, SQLException, IOException {
        if ("GET".equals(method) && "/activities".equals(path)) {
            return catalog.findActivities(RequestUtils.intParam(req, "city_id"));
        }
        if ("POST".equals(method) && "/activities".equals(path)) {
            auth.requireRole(requireUser(req), "admin");
            Map<String, Object> data = RequestUtils.readJson(req);
            return catalog.createActivity(
                RequestUtils.integer(data, "provider_id"),
                requireInt(data, "city_id", "Ciudad, nombre, descripción, categoría y precio son obligatorios"),
                RequestUtils.requiredString(data, "name", "Ciudad, nombre, descripción, categoría y precio son obligatorios"),
                RequestUtils.requiredString(data, "description", "Ciudad, nombre, descripción, categoría y precio son obligatorios"),
                RequestUtils.requiredString(data, "category", "Ciudad, nombre, descripción, categoría y precio son obligatorios"),
                requireDecimal(data, "price", "Ciudad, nombre, descripción, categoría y precio son obligatorios"),
                RequestUtils.integer(data, "duration_minutes"),
                RequestUtils.integer(data, "max_capacity"));
        }
        if (path.endsWith("/reviews")) {
            int activityId = RequestUtils.pathId(path, "/activities/");
            if ("GET".equals(method)) {
                return catalog.findReviews(activityId);
            }
            if ("POST".equals(method)) {
                Map<String, Object> data = RequestUtils.readJson(req);
                int rating = requireInt(data, "rating", "Rating debe ser entre 1 y 5");
                if (rating < 1 || rating > 5) {
                    throw new BadRequestException("Rating debe ser entre 1 y 5");
                }
                Integer customerId = RequestUtils.integer(data, "customerId");
                String comment = RequestUtils.string(data, "comment");
                return catalog.upsertReview(activityId, rating, comment == null ? "" : comment, customerId == null ? 1 : customerId);
            }
        }
        int id = RequestUtils.pathId(path, "/activities/");
        if ("GET".equals(method)) {
            return requireFound(catalog.findActivity(id), "Actividad no encontrada");
        }
        if ("PUT".equals(method)) {
            auth.requireRole(requireUser(req), "admin");
            Map<String, Object> data = RequestUtils.readJson(req);
            Map<String, Object> updated = catalog.updateActivity(
                id,
                RequestUtils.integer(data, "provider_id"),
                requireInt(data, "city_id", "Ciudad, nombre, descripción, categoría y precio son obligatorios"),
                RequestUtils.requiredString(data, "name", "Ciudad, nombre, descripción, categoría y precio son obligatorios"),
                RequestUtils.requiredString(data, "description", "Ciudad, nombre, descripción, categoría y precio son obligatorios"),
                RequestUtils.requiredString(data, "category", "Ciudad, nombre, descripción, categoría y precio son obligatorios"),
                requireDecimal(data, "price", "Ciudad, nombre, descripción, categoría y precio son obligatorios"),
                RequestUtils.integer(data, "duration_minutes"),
                RequestUtils.integer(data, "max_capacity"));
            return requireFound(updated, "Producto no encontrado");
        }
        if ("DELETE".equals(method)) {
            auth.requireRole(requireUser(req), "admin");
            if (!catalog.deleteActivity(id)) {
                throw new NotFoundException("Producto no encontrado");
            }
            return Map.of("message", "Producto eliminado");
        }
        throw new NotFoundException("Ruta no encontrada");
    }

    private Object aiPlanSubmissions(HttpServletRequest req, String method, String path) throws ApiException, SQLException, IOException {
        if ("POST".equals(method) && "/ai-plan-submissions".equals(path)) {
            Map<String, Object> data = RequestUtils.readJson(req);
            String name = RequestUtils.requiredString(data, "suggestedName", "Nombre y descripción son obligatorios");
            String description = RequestUtils.requiredString(data, "description", "Nombre y descripción son obligatorios");
            String category = RequestUtils.string(data, "category");
            BigDecimal price = RequestUtils.decimal(data, "suggestedPrice");
            return aiPlans.create(
                truncate(name, 150),
                RequestUtils.integer(data, "cityId"),
                description,
                truncate(category == null ? "Plan personalizado IA" : category, 100),
                price == null ? BigDecimal.ZERO : price,
                RequestUtils.integer(data, "maxCapacity"),
                RequestUtils.integer(data, "durationMinutes"));
        }
        if ("GET".equals(method) && "/ai-plan-submissions".equals(path)) {
            auth.requireRole(requireUser(req), "admin");
            return aiPlans.findAll();
        }
        if ("PATCH".equals(method) && path.endsWith("/reject")) {
            auth.requireRole(requireUser(req), "admin");
            int id = RequestUtils.pathId(path, "/ai-plan-submissions/");
            return requireFound(aiPlans.reject(id), "Propuesta no encontrada");
        }
        if ("PATCH".equals(method) && path.endsWith("/approve")) {
            auth.requireRole(requireUser(req), "admin");
            int id = RequestUtils.pathId(path, "/ai-plan-submissions/");
            Map<String, Object> submission = requireFound(aiPlans.findById(id), "Propuesta no encontrada");
            if (!"pending".equals(String.valueOf(submission.get("status")))) {
                throw new BadRequestException("Esta propuesta ya fue revisada");
            }
            if (submission.get("city_id") == null) {
                throw new BadRequestException("La propuesta necesita ciudad para publicarse");
            }
            return aiPlans.approve(id);
        }
        throw new NotFoundException("Ruta no encontrada");
    }

    private Object users(HttpServletRequest req, String method, String path) throws ApiException, SQLException, IOException {
        auth.requireRole(requireUser(req), "admin");
        if ("GET".equals(method) && "/users".equals(path)) {
            return users.findAllManaged();
        }
        if ("POST".equals(method) && "/users".equals(path)) {
            return register(req, true);
        }
        int id = RequestUtils.pathId(path, "/users/");
        if ("PUT".equals(method)) {
            Map<String, Object> data = RequestUtils.readJson(req);
            String email = RequestUtils.requiredString(data, "email", "Email, nombre y rol son obligatorios");
            String name = RequestUtils.requiredString(data, "name", "Email, nombre y rol son obligatorios");
            String role = validateRole(RequestUtils.requiredString(data, "role", "Email, nombre y rol son obligatorios"));
            return Map.of("message", "Usuario actualizado con éxito", "user", requireFound(users.update(id, email, name, role), "Usuario no encontrado"));
        }
        if ("DELETE".equals(method)) {
            if (!users.delete(id)) {
                throw new NotFoundException("Usuario no encontrado");
            }
            return Map.of("message", "Usuario eliminado con éxito");
        }
        throw new NotFoundException("Ruta no encontrada");
    }

    private Object orders(HttpServletRequest req, String method, String path) throws ApiException, SQLException, IOException {
        if ("GET".equals(method) && "/orders".equals(path)) {
            auth.requireRole(requireUser(req), "admin");
            return orders.findAllOrders();
        }
        if ("GET".equals(method) && "/orders/my".equals(path)) {
            AuthUser user = requireUser(req);
            auth.requireRole(user, "customer", "admin");
            return orders.findMyOrders(user.id());
        }
        if ("POST".equals(method) && "/orders".equals(path)) {
            AuthUser user = requireUser(req);
            auth.requireRole(user, "customer", "admin");
            Map<String, Object> data = RequestUtils.readJson(req);
            List<Map<String, Object>> items = RequestUtils.objectList(data, "items");
            if (items.isEmpty()) {
                throw new BadRequestException("El carrito debe contener al menos un producto");
            }
            String address = RequestUtils.requiredString(data, "address", "Indica un nombre de grupo o referencia");
            return orders.createOrder(user.id(), items, address);
        }
        if ("PATCH".equals(method) && path.endsWith("/status")) {
            auth.requireRole(requireUser(req), "admin");
            int id = RequestUtils.pathId(path, "/orders/");
            String status = RequestUtils.requiredString(RequestUtils.readJson(req), "status", "El nuevo estado es obligatorio");
            return requireFound(orders.updateStatus(id, status), "Pedido no encontrado");
        }
        throw new NotFoundException("Ruta no encontrada");
    }

    private Object fichajes(HttpServletRequest req, String method, String path) throws ApiException, SQLException {
        AuthUser user = requireUser(req);
        if ("GET".equals(method) && "/fichajes".equals(path)) {
            return fichajes.findByCustomer(user.id());
        }
        if ("POST".equals(method) && "/fichajes/clock-in".equals(path)) {
            return fichajes.insert(user.id(), "entrada");
        }
        if ("POST".equals(method) && "/fichajes/clock-out".equals(path)) {
            return fichajes.insert(user.id(), "salida");
        }
        throw new NotFoundException("Ruta no encontrada");
    }

    private Object login(HttpServletRequest req, HttpServletResponse res) throws IOException, ApiException, SQLException {
        Map<String, Object> data = RequestUtils.readJson(req);
        String email = RequestUtils.requiredString(data, "email", "Email y contraseña son obligatorios");
        String password = RequestUtils.requiredString(data, "password", "Email y contraseña son obligatorios");
        Map<String, Object> user = users.findByEmail(email);
        if (user == null) {
            throw new com.ssunen.backend.exception.UnauthorizedException("Usuario no encontrado");
        }
        if (!auth.passwordMatches(password, String.valueOf(user.get("password_hash")))) {
            throw new com.ssunen.backend.exception.UnauthorizedException("Contraseña incorrecta");
        }
        sendAuthCookie(res, auth.issueToken(user));
        return Map.of("message", "Login correcto", "user", publicUser(user));
    }

    private Object register(HttpServletRequest req, boolean adminCreate) throws IOException, ApiException, SQLException {
        Map<String, Object> data = RequestUtils.readJson(req);
        String email = RequestUtils.requiredString(data, "email", adminCreate ? "Email, contraseña y rol son obligatorios" : "Email y contraseña son obligatorios");
        String password = RequestUtils.requiredString(data, "password", adminCreate ? "Email, contraseña y rol son obligatorios" : "Email y contraseña son obligatorios");
        String role = adminCreate ? validateRole(RequestUtils.requiredString(data, "role", "Email, contraseña y rol son obligatorios")) : "customer";
        String name = RequestUtils.string(data, "name");
        String username = email.contains("@") ? email.substring(0, email.indexOf('@')) : email;
        Map<String, Object> user = users.create(email, auth.hashPassword(password), name == null || name.isBlank() ? "Usuario" : name, username, role);
        return Map.of(adminCreate ? "user" : "user", publicUser(user), "message", adminCreate ? "Usuario creado con éxito" : "Usuario registrado con éxito");
    }

    private AuthUser requireUser(HttpServletRequest req) throws ApiException {
        return auth.verify(RequestUtils.bearerToken(req));
    }

    private Map<String, Object> publicUser(Map<String, Object> user) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", user.get("id"));
        result.put("username", user.get("username"));
        result.put("email", user.get("email"));
        result.put("name", user.get("full_name") == null ? user.get("name") : user.get("full_name"));
        result.put("full_name", user.get("full_name"));
        result.put("role", auth.role(user));
        return result;
    }

    private String validateRole(String role) throws BadRequestException {
        if (!List.of("customer", "employee", "admin").contains(role)) {
            throw new BadRequestException("Rol inválido");
        }
        return role;
    }

    private int requireInt(Map<String, Object> data, String key, String message) throws BadRequestException {
        Integer value = RequestUtils.integer(data, key);
        if (value == null) {
            throw new BadRequestException(message);
        }
        return value;
    }

    private BigDecimal requireDecimal(Map<String, Object> data, String key, String message) throws BadRequestException {
        BigDecimal value = RequestUtils.decimal(data, key);
        if (value == null) {
            throw new BadRequestException(message);
        }
        return value;
    }

    private Map<String, Object> requireFound(Map<String, Object> value, String message) throws NotFoundException {
        if (value == null) {
            throw new NotFoundException(message);
        }
        return value;
    }

    private String truncate(String value, int max) {
        return value.length() <= max ? value : value.substring(0, max);
    }

    private void sendAuthCookie(HttpServletResponse res, String token) {
        Cookie cookie = new Cookie("token", token);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(24 * 60 * 60);
        res.addCookie(cookie);
    }

    private void clearAuthCookie(HttpServletResponse res) {
        Cookie cookie = new Cookie("token", "");
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        res.addCookie(cookie);
    }

    private void applyCors(HttpServletRequest req, HttpServletResponse res) {
        String origin = req.getHeader("Origin");
        res.setHeader("Access-Control-Allow-Origin", origin == null ? "*" : origin);
        res.setHeader("Vary", "Origin");
        res.setHeader("Access-Control-Allow-Credentials", "true");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    }

    private void writeJson(HttpServletResponse res, Object payload) throws IOException {
        res.getWriter().write(gson.toJson(payload));
    }

    private void writeError(HttpServletResponse res, int status, String message) throws IOException {
        res.setStatus(status);
        writeJson(res, Map.of("error", message));
    }
}
