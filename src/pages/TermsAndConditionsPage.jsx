import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

function TermsAndConditionsPage() {
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
          <h1 className="text-4xl font-bold text-primary-600 mb-8">Terms and Conditions</h1>
          <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="mb-4">
                By accessing and using Well2Day's BMI kiosk services and website, you accept and agree to be bound by the terms 
                and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Service Description</h2>
              <p className="mb-4">
                Well2Day provides state-of-the-art BMI (Body Mass Index) kiosk machines that offer personalized health-related data 
                and user engagement. Our services include:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>BMI measurement and analysis</li>
                <li>Health tracking and progress monitoring</li>
                <li>Personalized health insights and recommendations</li>
                <li>SMS notifications with health information</li>
                <li>Access to health analytics and historical data</li>
              </ul>
              <p className="mt-4">
                Our BMI machines are installed across 150+ locations in India and serve over 5 million users.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Responsibilities</h2>
              <p className="mb-3">As a user of Well2Day services, you agree to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide accurate and truthful information when using our services</li>
                <li>Use the services only for lawful purposes and in accordance with these Terms</li>
                <li>Not attempt to gain unauthorized access to our systems or networks</li>
                <li>Not interfere with or disrupt the services or servers</li>
                <li>Not use the services to transmit any harmful, offensive, or illegal content</li>
                <li>Maintain the confidentiality of your account credentials</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
                <li>Comply with all applicable laws and regulations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Payment Terms</h2>
              <p className="mb-4">
                Payment for our services is processed securely through Razorpay, a third-party payment gateway. 
                By making a payment, you agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide accurate payment information</li>
                <li>Authorize us to charge your payment method for the services</li>
                <li>Pay all applicable fees and charges</li>
                <li>Comply with Razorpay's terms and conditions</li>
              </ul>
              <p className="mt-4">
                All payments are processed in Indian Rupees (INR). Prices are subject to change without prior notice.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Refund and Cancellation Policy</h2>
              <p className="mb-4">
                Please refer to our detailed <a href="/refund-policy" className="text-primary-600 hover:underline font-medium">Refund & Cancellation Policy</a> for 
                information regarding refunds, cancellations, and related terms. By using our services, you acknowledge that you have 
                read and understood our refund policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Intellectual Property</h2>
              <p className="mb-4">
                All content, features, and functionality of the Well2Day services, including but not limited to text, graphics, logos, 
                images, software, and designs, are owned by Well2Day or its licensors and are protected by Indian and international 
                copyright, trademark, and other intellectual property laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. User-Generated Content</h2>
              <p className="mb-4">
                You retain ownership of any content you submit through our services. By submitting content, you grant Well2Day a 
                non-exclusive, royalty-free, worldwide license to use, reproduce, modify, and display such content for the purpose 
                of providing and improving our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Limitation of Liability</h2>
              <p className="mb-4">
                <strong>Disclaimer:</strong> Well2Day provides BMI measurement and health-related information for informational purposes only. 
                Our services are not intended to diagnose, treat, cure, or prevent any disease or medical condition.
              </p>
              <p className="mb-4">
                To the maximum extent permitted by law, Well2Day and its affiliates, officers, employees, and agents shall not be liable 
                for any indirect, incidental, special, consequential, or punitive damages, including but not limited to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Loss of profits, data, or business opportunities</li>
                <li>Personal injury or health-related issues</li>
                <li>Errors or inaccuracies in BMI measurements or health data</li>
                <li>Interruption or cessation of services</li>
                <li>Unauthorized access to or use of your data</li>
              </ul>
              <p className="mt-4">
                Our total liability for any claims arising from or related to the use of our services shall not exceed the amount 
                you paid for the specific service in question.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Medical Disclaimer</h2>
              <p className="mb-4">
                <strong>Important:</strong> The information provided by Well2Day BMI kiosks is for general informational purposes only 
                and is not intended as a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of 
                your physician or other qualified health provider with any questions you may have regarding a medical condition.
              </p>
              <p className="mb-4">
                Never disregard professional medical advice or delay in seeking it because of information obtained from our services. 
                Well2Day does not provide medical advice, and the use of our services does not create a doctor-patient relationship.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Service Availability</h2>
              <p className="mb-4">
                We strive to ensure that our services are available 24/7, but we do not guarantee uninterrupted or error-free service. 
                We reserve the right to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Modify, suspend, or discontinue any part of our services at any time</li>
                <li>Perform maintenance and updates that may temporarily affect service availability</li>
                <li>Restrict access to services for users who violate these Terms</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Privacy</h2>
              <p className="mb-4">
                Your use of our services is also governed by our <a href="/privacy-policy" className="text-primary-600 hover:underline font-medium">Privacy Policy</a>. 
                Please review our Privacy Policy to understand how we collect, use, and protect your personal information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Termination</h2>
              <p className="mb-4">
                We reserve the right to terminate or suspend your access to our services immediately, without prior notice, for any 
                violation of these Terms or for any other reason we deem necessary. Upon termination, your right to use the services 
                will cease immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Changes to Terms</h2>
              <p className="mb-4">
                We reserve the right to modify these Terms at any time. We will notify users of any material changes by posting the 
                updated Terms on our website and updating the "Last updated" date. Your continued use of our services after such 
                modifications constitutes your acceptance of the updated Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Governing Law and Jurisdiction</h2>
              <p className="mb-4">
                These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict 
                of law provisions. Any disputes arising from or relating to these Terms or our services shall be subject to the 
                exclusive jurisdiction of the courts in Salem, Tamil Nadu, India.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">15. Severability</h2>
              <p className="mb-4">
                If any provision of these Terms is found to be invalid, illegal, or unenforceable, the remaining provisions shall 
                continue in full force and effect.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">16. Contact Information</h2>
              <p className="mb-4">
                If you have any questions about these Terms and Conditions, please contact us:
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

export default TermsAndConditionsPage
