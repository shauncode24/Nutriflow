import { useEffect, useState } from "react";

function Avatar({ username }) {
  return (
    <img
      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
        username
      )}&background=ffffff&color=000000&rounded=true&size=35&font-size=0.35`}
      alt="Avatar"
    />
  );
}

function Sidebar(props) {
  const [isMobile, setIsMobile] = useState(
    window.matchMedia("(max-width: 767px)").matches
  );

  useEffect(() => {
    const handleMobileChange = (e) => setIsMobile(e.matches);
    const mobileMQ = window.matchMedia("(max-width: 767px)");
    mobileMQ.addEventListener("change", handleMobileChange);
    return () => mobileMQ.removeEventListener("change", handleMobileChange);
  }, []);

  return (
    <>
      <div className="main-default sidebar">
        <div className="main-default branding">NutriFlow</div>

        {!isMobile && (
          <div className="main-default options-div">
            <div className="main-default option">opiton1</div>
            <div className="main-default option">option2</div>
            <div className="main-default option">option3</div>
            <div className="main-default option">option4</div>
          </div>
        )}

        <div className="main-default user-icon-div">
          <Avatar username={props.user} /> {props.user}
        </div>
      </div>
    </>
  );
}

export default Sidebar;