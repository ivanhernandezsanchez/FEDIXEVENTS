function NotFound() {
    return (
        <div style={{ padding: "40px", backgroundColor: "#fff", height: "100vh" }}>
            <h1>Error 404: Página no encontrada</h1>
            <p>La ruta solicitada no existe.</p>
            <a href="/">Volver al inicio</a>
        </div>
    );
}

export default NotFound;