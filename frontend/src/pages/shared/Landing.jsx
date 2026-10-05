import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./Landing.css";

const Landing = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);

    gsap.registerPlugin(ScrollTrigger);

    gsap.to(".letter", {
      x: 0,
      opacity: 1,
      stagger: 0.08,
      duration: 1.2,
      ease: "power4.out",
    });

    gsap.to(".hero", {
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: 1,
      },
      opacity: 0,
      scale: 0.95,
      y: -100
    });

    const isMobile = window.innerWidth <= 768;

    gsap.fromTo(
      ".cinematic-content",
      {
        opacity: isMobile ? 0.4 : 0,
        y: isMobile ? 25 : 120,
        scale: isMobile ? 0.96 : 0.92
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".cinematic-section",
          start: isMobile ? "top 90%" : "top 75%",
          end: isMobile ? "top 25%" : "center center",
          scrub: isMobile ? 0.6 : 1.2,
        }
      }
    );

    ScrollTrigger.refresh();

    // Clean up GSAP instances when unmounting
    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  const text = "Welcome to HealthAI";

  const scrollToCinematic = () => {
    const elem = document.getElementById("cinematic-section");
    if (elem) {
      elem.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="landing-page-root">
      <div className="hero">
        <div className="particles">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>

        <div className="title-wrapper">
          {text.split("").map((char, index) => (   
            <div key={index} className="letter-wrapper">
              <div className="letter-smoke"></div>
              <span className="letter">
                {char === " " ? "\u00A0" : char}
              </span>
            </div>
          ))}
        </div>

        <p className="scroll-text" onClick={scrollToCinematic} style={{ cursor: 'pointer' }}>
          Scroll to begin ↓
        </p>
      </div>

      <div className="cinematic-section" id="cinematic-section">
        <div className="cinematic-content">
          <div className="section-heading">
            <h2>
              Intelligent Care Begins With Understanding
            </h2>
          </div>

          <div className="section-image">
            <img
              src="/images/doctor.png"
              alt="doctor"
            />
          </div>

          <div className="section-description">
            <p>
              Describe your symptoms naturally and let HealthAI deliver intelligent health insights, personalized condition analysis, and seamless doctor appointment recommendations — all in one experience.
            </p>
          </div>

          <div className="action-side">
            <button className="enter-btn" onClick={() => navigate("/login")}>
              Begin Health Analysis
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
