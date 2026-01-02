import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

function RefundPolicyPage() {
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
          <h1 className="text-4xl font-bold text-primary-600 mb-8">Refund & Cancellation Policy</h1>
          <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. General Policy</h2>
              <p className="mb-4">
                Well2Day is committed to providing quality BMI measurement and health tracking services. This Refund & Cancellation 
                Policy outlines the terms and conditions under which refunds may be processed.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Refund Eligibility</h2>
              <p className="mb-4">
                <strong>No refunds will be provided once payment is completed.</strong> All payments made for Well2Day services are 
                final and non-refundable, except in the following exceptional circumstances:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Technical failure of the BMI kiosk machine that prevents the service from being delivered</li>
                <li>Duplicate payment made in error (subject to verification)</li>
                <li>Payment made for a service that was not available at the time of payment</li>
              </ul>
              <p className="mt-4">
                Refund requests will be evaluated on a case-by-case basis and are subject to our discretion and verification.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Refund Process</h2>
              <p className="mb-4">
                If you believe you are eligible for a refund under the exceptional circumstances mentioned above, please follow 
                these steps:
              </p>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>Contact us within 7 days of the payment date</li>
                <li>Provide your transaction ID, payment receipt, and a detailed explanation of the issue</li>
                <li>Our team will review your request within 5-7 working days</li>
                <li>If approved, the refund will be processed to your original payment method</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Refund Time Period</h2>
              <p className="mb-4">
                If your refund request is approved:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Processing Time:</strong> 5-7 working days from the date of approval</li>
                <li><strong>Credit Card/Debit Card:</strong> The refund will appear in your account within 5-7 working days after processing</li>
                <li><strong>UPI/Wallet:</strong> The refund will be credited to your UPI account or wallet within 5-7 working days</li>
                <li><strong>Net Banking:</strong> The refund will be credited to your bank account within 5-7 working days</li>
              </ul>
              <p className="mt-4">
                Please note that the actual credit to your account may take additional time depending on your bank or payment provider's 
                processing time.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Refund Mode</h2>
              <p className="mb-4">
                All refunds will be processed to the <strong>original payment method</strong> used for the transaction. 
                For example:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>If you paid via credit card, the refund will be credited to the same credit card</li>
                <li>If you paid via UPI, the refund will be credited to the same UPI account</li>
                <li>If you paid via debit card, the refund will be credited to the same debit card</li>
                <li>If you paid via net banking, the refund will be credited to the same bank account</li>
              </ul>
              <p className="mt-4">
                We cannot process refunds to a different payment method or account than the one used for the original transaction.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Cancellation Policy</h2>
              <p className="mb-4">
                Since our BMI measurement services are typically completed immediately upon payment, cancellation requests are generally 
                not applicable. However, if you have scheduled a service or made a payment for a future service:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Cancellation requests must be made at least 24 hours before the scheduled service time</li>
                <li>Cancellations made within 24 hours of the service may not be eligible for refund</li>
                <li>All cancellation requests must be submitted via email to our support team</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Non-Refundable Services</h2>
              <p className="mb-4">
                The following are explicitly non-refundable:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Completed BMI measurements and health reports</li>
                <li>Services that have been fully delivered</li>
                <li>Payments made for services that were successfully completed</li>
                <li>Any fees or charges associated with payment processing</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Payment Gateway Processing</h2>
              <p className="mb-4">
                All payments are processed securely through Razorpay. In case of any payment-related issues or disputes:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Contact our support team first with your transaction details</li>
                <li>We will coordinate with Razorpay to resolve payment issues</li>
                <li>Refund processing is subject to Razorpay's policies and procedures</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Dispute Resolution</h2>
              <p className="mb-4">
                If you have any concerns or disputes regarding a payment or refund:
              </p>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>Contact our customer support team via email</li>
                <li>Provide all relevant transaction details and documentation</li>
                <li>Our team will investigate and respond within 5-7 working days</li>
                <li>If the dispute cannot be resolved, you may contact your bank or payment provider</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Contact for Refunds</h2>
              <p className="mb-4">
                For refund requests, inquiries, or assistance, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="mb-2"><strong>Email:</strong> <a href="mailto:geetha@amsoftsolutions.com" className="text-primary-600 hover:underline">geetha@amsoftsolutions.com</a></p>
                <p className="mb-2"><strong>Phone:</strong> <a href="tel:+918220692921" className="text-primary-600 hover:underline">+91 8220692921</a>, <a href="tel:+919884196298" className="text-primary-600 hover:underline">+91 9884196298</a>, <a href="tel:+919444069919" className="text-primary-600 hover:underline">+91 9444069919</a></p>
                <p className="mb-2"><strong>Address:</strong> 21, Womens SIDCO Industrial estate karuppur, SALEM-636011 TAMILNADU, India</p>
                <p className="mt-4 text-sm text-gray-600">
                  <strong>Please include in your email:</strong> Transaction ID, Payment Date, Amount, Reason for Refund Request
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Changes to Refund Policy</h2>
              <p className="mb-4">
                We reserve the right to modify this Refund & Cancellation Policy at any time. Changes will be effective immediately 
                upon posting on our website. We encourage you to review this policy periodically.
              </p>
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

export default RefundPolicyPage
