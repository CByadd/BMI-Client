import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

function Footer() {
  const footerRef = useRef(null)

  useEffect(() => {
    if (footerRef.current) {
      gsap.fromTo(footerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", delay: 0.2 }
      )
    }
  }, [])

  const currentYear = new Date().getFullYear()

  return (
    <footer ref={footerRef} className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Well2Day</h3>
            <p className="text-sm text-gray-600 mb-4">
              A Premium Wellness Company providing state-of-the-art BMI kiosks and personalized health insights.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://www.well2day.in" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-700 transition-colors"
                aria-label="Visit Well2Day website"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                  <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="/about-us" 
                  className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
                >
                  About Us
                </a>
              </li>
              <li>
                <a 
                  href="/contact-us" 
                  className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
                >
                  Contact Us
                </a>
              </li>
              <li>
                <a 
                  href="/privacy-policy" 
                  className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a 
                  href="/terms-and-conditions" 
                  className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
                >
                  Terms & Conditions
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="/refund-policy" 
                  className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
                >
                  Refund Policy
                </a>
              </li>
              <li>
                <a 
                  href="/terms-and-conditions" 
                  className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
                >
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <svg className="w-4 h-4 mr-2 mt-0.5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href="mailto:geetha@amsoftsolutions.com" className="hover:text-primary-600 transition-colors">
                  geetha@amsoftsolutions.com
                </a>
              </li>
              <li className="flex items-start">
                <svg className="w-4 h-4 mr-2 mt-0.5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <a href="tel:+918220692921" className="hover:text-primary-600 transition-colors">
                  +91 8220692921
                </a>
              </li>
              <li className="flex items-start">
                <svg className="w-4 h-4 mr-2 mt-0.5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-xs">
                  21, Womens SIDCO Industrial estate karuppur<br />
                  SALEM-636011, TAMILNADU, India
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-600">
              © {currentYear} Well2Day. All rights reserved by Amsoft Services.
            </p>
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <span>5K+ Users</span>
              <span>•</span>
              <span>50+ Machines</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
