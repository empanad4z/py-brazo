const Navbar = () => {
  return (
    <nav className="sticky">
      <div className="bg-blue-500 left-0 top-0  flex items-center justify-center">
        <span
          className="italic font-medium text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl p-3"
          style={{
            fontFamily: '"IBM Plex Mono"',
            fontWeight: 500,
            textShadow: "1px 1px 0 black, -1px -1px 0 black, 1px -1px 0 black, -1px 1px 0 black"
          }}
        >
          ESP32 DRAWING APP
        </span>
      </div>
    </nav>
  );
}

export default Navbar;
