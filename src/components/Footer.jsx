function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <p>This system does not replace the official church calendar.</p>
        <p>&copy; {new Date().getFullYear()} Timo Matis, Webmaster. All rights reserved.</p>
        <p>
          This is not an official website of The Church of Jesus Christ of
          Latter-day Saints.
        </p>
      </div>
    </footer>
  );
}

export default Footer;