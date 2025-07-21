import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      backgroundColor: "#f7f7f7",
      textAlign: "center"
    }}>
      <h1>👋 Welcome to Skill Swap</h1>
      <p>Connect, trade, and grow your skills!</p>

      <div style={{ marginTop: "20px" }}>
        <Link to="/login">
          <button style={{ margin: "10px", padding: "10px 20px" }}>Login</button>
        </Link>
        <Link to="/register">
          <button style={{ margin: "10px", padding: "10px 20px" }}>Register</button>
        </Link>
      </div>
    </div>
  );
};

export default Home;
