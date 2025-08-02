import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="home-container">
      <h1>Welcome to Skill Swap</h1>
      <p>Connect, trade, and grow your skills!</p>

      {/* Navigation buttons */}
      <div className="home-buttons">
        <Link to="/login" className="btn btn-primary">
          Login
        </Link>
        <Link to="/register" className="btn btn-secondary">
          Register
        </Link>
      </div>
    </div>
  );
};

export default Home;