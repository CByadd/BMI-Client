import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

function PrivacyPolicyPage() {
  const containerRef = useRef(null)

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
      )
    }
  }, [])

  return (
    <div className="min-h-screen gradient-bg py-12 px-4">
      <div className="max-w-4xl mx-auto" ref={containerRef}>
        <div className="card">
          <h1 className="text-4xl font-bold text-primary-600 mb-8">Privacy Policy</h1>
          <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
              <p className="mb-4">
                Welcome to Well2Day. We are committed to protecting your privacy and ensuring the security of your personal information. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our BMI kiosk services 
                and website.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
              <p className="mb-3">We collect the following types of information:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Personal Information:</strong> Name, phone number, email address (when provided)</li>
                <li><strong>Health Data:</strong> Height, weight, BMI measurements, and related health metrics</li>
                <li><strong>Payment Information:</strong> Payment details processed securely through Razorpay (we do not store your full payment card details)</li>
                <li><strong>Device Information:</strong> Device type, browser information, IP address, and usage patterns</li>
                <li><strong>Location Data:</strong> General location information based on the BMI kiosk location</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
              <p className="mb-3">We use the collected information for the following purposes:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>To provide and maintain our BMI measurement services</li>
                <li>To process payments and manage transactions through Razorpay</li>
                <li>To send you health-related information, SMS notifications, and updates</li>
                <li>To improve our services and user experience</li>
                <li>To analyze usage patterns and generate analytics</li>
                <li>To comply with legal obligations and protect our rights</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Payment Processing via Razorpay</h2>
              <p className="mb-4">
                All payments are processed securely through Razorpay, a PCI-DSS compliant payment gateway. 
                When you make a payment:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Your payment information is encrypted and transmitted directly to Razorpay</li>
                <li>We do not store your complete credit/debit card details on our servers</li>
                <li>Razorpay handles all payment processing in accordance with their privacy policy</li>
                <li>We only receive confirmation of successful payments and transaction IDs</li>
              </ul>
              <p className="mt-4">
                For more information about Razorpay's privacy practices, please visit: 
                <a href="https://razorpay.com/privacy/" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline ml-1">
                  https://razorpay.com/privacy/
                </a>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Security</h2>
              <p className="mb-4">
                We implement appropriate technical and organizational security measures to protect your personal information:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Encryption of data in transit using SSL/TLS protocols</li>
                <li>Secure storage of data on protected servers</li>
                <li>Regular security audits and updates</li>
                <li>Access controls and authentication mechanisms</li>
                <li>Regular backups and disaster recovery procedures</li>
              </ul>
              <p className="mt-4">
                However, no method of transmission over the Internet or electronic storage is 100% secure. 
                While we strive to use commercially acceptable means to protect your information, we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Data Sharing and Disclosure</h2>
              <p className="mb-3">We do not sell your personal information. We may share your information only in the following circumstances:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Service Providers:</strong> With trusted third-party service providers (like Razorpay) who assist in operating our services</li>
                <li><strong>Legal Requirements:</strong> When required by law, court order, or government regulation</li>
                <li><strong>Business Transfers:</strong> In connection with any merger, sale, or acquisition of our business</li>
                <li><strong>With Your Consent:</strong> When you explicitly authorize us to share your information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Data Retention</h2>
              <p className="mb-4">
                We retain your personal information for as long as necessary to provide our services and comply with legal obligations. 
                Health data and BMI records are retained to allow you to track your progress over time. 
                You may request deletion of your data at any time by contacting us.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Your Rights</h2>
              <p className="mb-3">You have the right to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Access your personal information</li>
                <li>Correct inaccurate or incomplete data</li>
                <li>Request deletion of your personal information</li>
                <li>Object to processing of your data</li>
                <li>Request data portability</li>
                <li>Withdraw consent at any time</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Cookies and Tracking</h2>
              <p className="mb-4">
                We may use cookies and similar tracking technologies to enhance your experience, analyze usage patterns, 
                and improve our services. You can control cookie preferences through your browser settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Children's Privacy</h2>
              <p className="mb-4">
                Our services are not intended for children under the age of 18. We do not knowingly collect personal information 
                from children. If you believe we have collected information from a child, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Changes to This Privacy Policy</h2>
              <p className="mb-4">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new 
                Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy 
                periodically for any changes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact Us</h2>
              <p className="mb-4">
                If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="mb-2"><strong>Email:</strong> <a href="mailto:geetha@amsoftsolutions.com" className="text-primary-600 hover:underline">geetha@amsoftsolutions.com</a></p>
                <p className="mb-2"><strong>Phone:</strong> <a href="tel:+918220692921" className="text-primary-600 hover:underline">+91 8220692921</a>, <a href="tel:+919884196298" className="text-primary-600 hover:underline">+91 9884196298</a>, <a href="tel:+919444069919" className="text-primary-600 hover:underline">+91 9444069919</a></p>
                <p className="mb-2"><strong>Address:</strong> 21, Womens SIDCO Industrial estate karuppur, SALEM-636011 TAMILNADU, India</p>
              </div>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <a href="/" className="text-primary-600 hover:underline font-medium">← Back to Home</a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PrivacyPolicyPage
