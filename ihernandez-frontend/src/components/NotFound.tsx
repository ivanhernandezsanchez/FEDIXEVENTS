function NotFound() {
    return (
        <div style={{ padding: "40px", backgroundColor: "#fff", height: "100vh", color: "#172033" }}>
            <h1>Error 404: Page not found</h1>
            <p>The requested page doesn't exist.</p>
            <a href="/">Back to home</a>
        </div>
    );
}

export default NotFound;