import Link from "next/link";
import Image from "next/image";
import styles from "../../styles/Footer.module.css";
import { useEffect, useState } from "react";
// import { Facebook, Twitter, Instagram } from "lucide-react"

function Footer({ FooterCMSData }: any) {
  const sanitizedHtml = FooterCMSData?.cmsBlocks?.items?.[0]?.content;
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const alreadySubscribed = localStorage.getItem("newsletterSubscribed");
    if (alreadySubscribed === "true") {
      setSubscribed(true);
      setMessage("Thank you for subscribing!");
    }
  }, []);

  const handleSubscribe = async () => {
    if (!email || !email.includes("@")) {
      setMessage("Please enter a valid email.");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.baseURL}sendgrid/index/subscribe?email=${encodeURIComponent(
          email
        )}`
      );

      if (response.ok) {
        localStorage.setItem("newsletterSubscribed", "true");
        setSubscribed(true);
        setMessage("Thank you for subscribing!");
      } else {
        setMessage("Subscription failed. Please try again.");
      }
    } catch (error) {
      setMessage("Something went wrong. Please try again later.");
    }
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubscribe();
    }
  };
  return (
    // <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
    <footer className={styles.footer}>
      {/* Newsletter Section */}
      <div className={styles.newsletterSection}>
        <div className={styles.newsletterContent}>
          <h2 className={styles.newsletterHeading}>
            Join Our Newsletter to
            <br />
            Keep Up To Date With Us
          </h2>
          <div className={styles.subscribeForm}>
            {subscribed ? (
              <p className={styles.SubscribeSuccess}>{message}</p>
            ) : (
              <>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email to subscribe"
                  className={styles.subscribeInput}
                  onKeyDown={handleKeyDown}
                />
                <button
                  className={styles.subscribeButton}
                  onClick={handleSubscribe}
                >
                  SUBSCRIBE
                </button>
                {!subscribed && message && (
            <p style={{ color: "red", marginTop: "10px" }}>{message}</p>
          )}
              </>
            )}
          </div>
     
        </div>
      </div>

      <div className={styles.divider}></div>

      {/* Main Footer Content */}
      <div className={styles.container}>
        {/* Logo and Description Section */}
        <div className={styles.logoSection}>
          <Link href="/" className={styles.footerLogo}>
            <Image
              src="/Logo/TF_Full_Logo.png"
              alt="Full Logo"
              width={200}
              height={40}
              className={styles.logo}
              style={{ filter: "invert()" }}
            />

            {/* {process.env.logoURL?.length == 0 ? (
              `${process.env.logoText}`
            ) : (
              <Image
                src={`${process.env.logoText}`}
                alt="Logo"
                width={120}
                height={35}
                className={styles.logo}
              />
            )} */}
          </Link>
          <p className={styles.footerDescription}>
          TrueFacet is the modern alternative for buying jewelry and watches. We are an online marketplace rooted in trust and transparency.
          </p>
          <div className={styles.socialLinks}>
            <Link
              href="https://www.facebook.com/profile.php?id=100088095545673&amp;mibextid=LQQJ4d&amp;rdid=GzonofqiS7wvqQ9V&amp;share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2FhijNeHjqKVeZ4eJM%2F%3Fmibextid%3DLQQJ4d"
             target="_blank" rel="noopener noreferrer"
              aria-label="Facebook"
            >
              <div className={styles.socialIcon}>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </div>
            </Link>
            <Link href="http://twitter.com/truefacet" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <div className={styles.socialIcon}>
                <Image src={'/Images/x.png'} height={16} width={16} alt={"x icon"} style={{filter:'invert()'}}/>
              </div>
            </Link>
            <Link
              href="http://www.pinterest.com/truefacet"
              aria-label="Pinterest"
              target="_blank" rel="noopener noreferrer"
            >
              <div className={styles.socialIcon}>
              <Image src={'/Images/pinterest-icon.png'} height={20} width={20} alt={"p icon"} style={{filter:'invert()'}}/>
              </div>
            </Link>
            <Link href="http://instagram.com/truefacet" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
              <div className={styles.socialIcon}>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </div>
            </Link>
          </div>
        </div>

        {/* Shop Section */}
        <div className={styles.linksSection}>
          <h3 className={styles.linkSectionTitle}>SHOP</h3>
          <div className={styles.linksList}>
            <Link target="_blank" href="/brand">Brands</Link>
            <Link target="_blank" href="/jewelry.html">Jewelry</Link>
            <Link target="_blank" href="/watches.html">Watches</Link>
            <Link target="_blank" href="/handbags.html">Handbags</Link>
          </div>
        </div>

        {/* Customer Services Section */}
        <div className={styles.linksSection}>
          <h3 className={styles.linkSectionTitle}>HELP</h3>
          <div className={styles.linksList}>
            <Link target="_blank" href="/faq">FAQ</Link>
            <Link target="_blank" href="/returns">Returns</Link>
            <Link target="_blank" href="/how-to-check-size-and-fit">Size/Fit</Link>
            <Link target="_blank" href="/glossary">Glossary</Link>
            <Link target="_blank" href="/shipping">Shipping </Link>
            <Link target="_blank" href="/watch-warranty">Watch Warranty</Link>
            <Link target="_blank" href="/faq">Contact Us</Link>
          </div>
        </div>

        {/* About Section */}
        <div className={styles.linksSection}>
          <h3 className={styles.linkSectionTitle}>About</h3>
          <div className={styles.linksList}>
            <Link target="_blank" href="/authenticity-promise">How It Works</Link>
            <Link target="_blank" href="/authenticity-promise">Authenticity Promise</Link>
            <Link target="_blank" href="/guide/">The Blog</Link>
            <Link target="_blank" href="/bitpay-terms">Bitpay Cryptocurrency</Link>
            <Link target="_blank" href="/ios-app">IOS App</Link>
          </div>
        </div>
      </div>

      <div className={styles.divider}></div>

      {/* Bottom Section */}
      <div className={styles.bottomSection}>
        <div className={styles.copyright}>© Truefacet 2025</div>
        <div className={styles.legalLinks}>
          <Link target="_blank" href="/terms-of-service">Terms Of Service
          </Link>
          <Link target="_blank" href="/privacy-policy">Privacy Policy</Link>
          <Link target="_blank" href="/consignment-terms">Consignment Terms</Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
