import "./LandingPage.css";
import Features from "./components/Features";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <>
      <motion.div
        className="landing landing-body"
        // initial={{ opacity: 0 }}
        // animate={{ opacity: 1 }}
        // transition={{ duration: 1 }}
      >
        <motion.div
          className="landing landing-header"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1 }}
        >
          NutriFlow
          <Link to="/login" className="landing header-button">
            Sign Up
          </Link>
        </motion.div>

        <div className="landing landing-herosection">
          <motion.div
            className="landing herosection-text"
            initial={{ x: -80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <div className="landing herosection-text-1">
              Your Personal Meal and Workout Planner
            </div>
            <div className="landing herosection-text-2">
              Plan your meals, schedule your workouts, and track <br /> your
              progress all in one place. Achieve your health <br />
              and fitness goals with ease.
            </div>
            <Link to="/login" className="landing herosection-button">
              Get Started
            </Link>
          </motion.div>
          <motion.div
            className="landing herosection-image"
            initial={{ x: 80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <img
              src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Zml0bmVzcyUyMGZvb2R8ZW58MHx8MHx8fDA%3D"
              height="91%"
              width="94%"
            />
          </motion.div>
        </div>

        <motion.div
          className="landing landing-features"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <div className="landing features-header">
            <h2>Key Features</h2>
            <p>
              Everything you need to transform your health journey in one simple
              platform.
            </p>
          </div>
          <div className="landing features-body">
            <Features
              img="https://cdn-icons-png.flaticon.com/512/182/182727.png"
              feature="Meal Planning"
              desc="Create customized meal plans based on your dietary preferences and nutritional goals with our easy-to-use tools."
            />
            <Features
              img="https://cdn-icons-png.flaticon.com/512/3860/3860254.png"
              feature="Workout Planning"
              desc="Build personalized workout routines tailored to your fitness level, goals, and available equipment."
            />
            <Features
              img="https://static.thenounproject.com/png/94238-200.png"
              feature="Progress Tracking"
              desc="Monitor your progress with comprehensive tracking tools that help you stay accountable and motivated."
            />
          </div>
        </motion.div>

        <motion.div
          className="landing landing-footer"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.8 }}
        >
          © {new Date().getFullYear()} NutriFlow.
        </motion.div>
      </motion.div>
    </>
  );
}
